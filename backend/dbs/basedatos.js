import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener ruta absoluta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function abrirBaseDatos() {
  const db = await open({
    filename: path.join(__dirname, 'data.db'), // Esto asegura que se cree en la carpeta "dbs"
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Documento TEXT NOT NULL,
      Nombre1 TEXT,
      Nombre2 TEXT,
      Apellido1 TEXT,
      Apellido2 TEXT,
      Correo TEXT,
      Telefono TEXT
    );
  `);

  return db;
}