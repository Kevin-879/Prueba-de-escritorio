import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { abrirBaseDatos } from './dbs/basedatos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class A_Login {
  constructor(puerto) {
    this.puerto = puerto;
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.configurarMiddleware();
    this.configurarRutas();
  }

  configurarMiddleware() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'Front'))); // Carpeta de archivos front
  }

  configurarRutas() {
    // Ruta login
    this.app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const db = await abrirBaseDatos();
      const user = await db.get(`SELECT * FROM usuarios WHERE email = ? AND password = ?`, [email, password]);

      if (!user) return res.status(401).send('Credenciales inválidas');

      // Redirige según el rol
      if (user.role === 'admin') {
        res.redirect('../vista/index.html');
      } else {
        res.redirect('../vista/operario.html');
      }
    });

    // Ruta registro
    this.app.post('/register', async (req, res) => {
      const { name, email, password } = req.body;
      const db = await abrirBaseDatos();

      try {
        await db.run(`
          INSERT INTO usuarios (name, email, password, role)
          VALUES (?, ?, ?, ?)
        `, [name, email, password, 'operario']);
        res.redirect('../vista/login.html');
      } catch (err) {
        console.error(err);
        res.status(400).send('Error al registrar usuario');
      }
    });
  }

  iniciar() {
    this.app.listen(this.puerto, () => {
      console.log(`Servidor de login activo en http://localhost:${this.puerto}`);
    });
  }
}