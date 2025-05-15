import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function abrirBaseDatos() {
  const db = await open({
    filename: path.join(__dirname, 'data.db'),
    driver: sqlite3.Database
  });

  // Crear tabla de personas
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

  // Crear tabla de usuarios
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'operario'))
    );
  `);

  // Insertar usuarios por defecto (admin y operario) si no existen
  const adminExists = await db.get(`SELECT 1 FROM usuarios WHERE email = ?`, ['admin@admin.com']);
  if (!adminExists) {
    await db.run(`
      INSERT INTO usuarios (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `, ['Administrador', 'admin@admin.com', 'admin123', 'admin']);
  }

  const operarioExists = await db.get(`SELECT 1 FROM usuarios WHERE email = ?`, ['operario@correo.com']);
  if (!operarioExists) {
    await db.run(`
      INSERT INTO usuarios (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `, ['Operario', 'operario@correo.com', 'operario123', 'operario']);
  }

  return db;
}
