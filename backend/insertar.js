import express from "express";
import bodyParser from 'body-parser';
import cors from "cors";
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { abrirBaseDatos } from './dbs/basedatos.js';

export class A_Insertar {
  constructor(puerto) {
    this.puerto = puerto;
    this.app = express();

    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    this.app.post('/api/insertar/csv', upload.single('csv'), this.a_insertar_csv.bind(this));
    this.app.post('/api/insertar', this.a_insertar.bind(this));
  }

  async a_insertar(req, res) {
    try {
      const db = await abrirBaseDatos();
      const {
        Documento, Nombre1, Nombre2, Apellido1, Apellido2, Correo, Telefono
      } = req.body;

      await db.run(`
        INSERT INTO personas (Documento, Nombre1, Nombre2, Apellido1, Apellido2, Correo, Telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [Documento, Nombre1, Nombre2, Apellido1, Apellido2, Correo, Telefono]);

      res.json({ mensaje: 'Estudiante insertado correctamente' });
    } catch (error) {
      console.error("Error al insertar:", error);
      res.status(500).send('Error interno del servidor');
    }
  }

  async a_insertar_csv(req, res) {
  if (!req.file) {
    return res.status(400).send('No se ha proporcionado un archivo CSV.');
  }

  const db = await abrirBaseDatos();
  const results = [];
  let duplicados = 0;
  let incompletos = 0;

  try {
    const stream = Readable.from(req.file.buffer.toString());
    const parser = stream.pipe(csvParser({ skipEmptyLines: true }));

    for await (const row of parser) {
      const { Documento, Nombre1, Nombre2, Apellido1, Apellido2, Correo, Telefono } = row;

      // Validar que los campos obligatorios existan
      if (!Documento || !Nombre1 || !Apellido1 || !Correo || !Telefono) {
        incompletos++;
        continue;
      }

      // Verificar duplicado por Documento
      const existe = await db.get(`SELECT 1 FROM personas WHERE Documento = ?`, [Documento]);
      if (existe) {
        duplicados++;
        continue;
      }

      await db.run(`
        INSERT INTO personas (Documento, Nombre1, Nombre2, Apellido1, Apellido2, Correo, Telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [Documento, Nombre1, Nombre2, Apellido1, Apellido2, Correo, Telefono]);

      results.push(Documento);
    }

    res.json({
      mensaje: `✔️ Se insertaron ${results.length} estudiantes.`,
      duplicados,
      incompletos
    });

  } catch (error) {
    console.error("Error al insertar datos del CSV:", error);
    res.status(500).send('Error al procesar el archivo CSV');
  }
}


  iniciar() {
    this.app.listen(this.puerto, () => {
      console.log(`Servidor de inserción escuchando en el puerto ${this.puerto}`);
    });
  }
}
