// A_Eliminar.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { abrirBaseDatos } from './dbs/basedatos.js';

export class A_Eliminar {
    constructor(puerto) {
        this.puerto = puerto;

        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        this.app.delete("/api/eliminar/:documento", this.a_eliminar.bind(this));
    }

    async a_eliminar(req, res) {
        try {
            const documento = req.params.documento;
            const db = await abrirBaseDatos();

            const result = await db.run(
                `DELETE FROM personas WHERE Documento = ?`,
                documento
            );

            if (result.changes > 0) {
                res.json({ deletedCount: result.changes });
            } else {
                res.status(404).send("Documento no encontrado");
            }
        } catch (error) {
            console.error("Error al eliminar", error);
            res.status(500).send("Error interno del servidor");
        }
    }

    iniciar() {
        this.app.listen(this.puerto, () => {
            console.log(`Servidor de eliminación escuchando en el puerto ${this.puerto}`);
        });
    }
}