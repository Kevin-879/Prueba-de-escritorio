import express from "express";
import bodyParser from 'body-parser';
import cors from "cors";
import { abrirBaseDatos } from './dbs/basedatos.js';

export class A_Actualizar {
    constructor(puerto) {
        this.puerto = puerto;
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        this.app.put('/api/actualizar', this.a_actualizar.bind(this));
    }

    async a_actualizar(req, res) {
        try {
            const db = await abrirBaseDatos();
            const body = req.body;

            const resultado = await db.run(`
                UPDATE personas
                SET Nombre1 = ?, Nombre2 = ?, Apellido1 = ?, Apellido2 = ?, Correo = ?, Telefono = ?
                WHERE Documento = ?
            `, [
                body.Nombre1,
                body.Nombre2,
                body.Apellido1,
                body.Apellido2,
                body.Correo,
                body.Telefono,
                body.Documento
            ]);

            if (resultado.changes > 0) {
                const actualizado = await db.get("SELECT * FROM personas WHERE Documento = ?", [body.Documento]);
                res.json(actualizado);
            } else {
                res.status(404).send("Documento no encontrado");
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
            res.status(500).send("Error interno del servidor");
        }
    }

    iniciar() {
        this.app.listen(this.puerto, () => {
            console.log(`Servidor de actualización escuchando en el puerto ${this.puerto}`);
        });
    }
}