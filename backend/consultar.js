import express from "express";
import bodyParser from 'body-parser';
import cors from "cors";
import { abrirBaseDatos } from './dbs/basedatos.js';

export class A_Consultar {
    constructor(puerto) {
        this.puerto = puerto;
        this.app = express();

        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        this.app.get('/api/consultar', this.a_ConsultarTodos.bind(this));
        this.app.get('/api/consultar/:documento', this.a_ConsultarUno.bind(this));
    }

    async a_ConsultarTodos(req, res) {
        try {
            const db = await abrirBaseDatos();
            const personas = await db.all('SELECT * FROM personas');
            res.json(personas);
        } catch (error) {
            console.error('Error al consultar todos:', error);
            res.status(500).send('Error interno del servidor');
        }
    }

    async a_ConsultarUno(req, res) {
        try {
            const documento = req.params.documento.trim();
            const db = await abrirBaseDatos();

            const persona = await db.get('SELECT * FROM personas WHERE Documento = ?', documento);
            if (persona) {
                res.json(persona);
            } else {
                res.status(404).json({ mensaje: 'Documento no encontrado' });
            }
        } catch (error) {
            console.error('Error al consultar uno:', error);
            res.status(500).send('Error interno del servidor');
        }
    }

    iniciar() {
        this.app.listen(this.puerto, () => {
            console.log(`Servidor de consulta escuchando en el puerto ${this.puerto}`);
        });
    }
}
