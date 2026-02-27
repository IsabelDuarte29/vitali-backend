const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/* ============================
   GET - Obtener todos los usuarios
============================ */
router.get('/', (req, res) => {
  const sql = `
    SELECT id, nombre, apellido_paterno, apellido_materno,
           username, rol, activo, created_at, updated_at
    FROM usuarios
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Usuario por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id, nombre, apellido_paterno, apellido_materno,
           username, rol, activo, created_at, updated_at
    FROM usuarios
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET usuario por ID:', err);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  });
});

/* ============================
   POST - Crear usuario
============================ */
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      username,
      password,
      rol,
      activo
    } = req.body;

    if (!nombre || !apellido_paterno || !username || !password || !rol) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios'
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `
      INSERT INTO usuarios
      (nombre, apellido_paterno, apellido_materno,
       username, password_hash, rol, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        nombre,
        apellido_paterno,
        apellido_materno || null,
        username,
        password_hash,
        rol,
        activo !== undefined ? activo : 1
      ],
      (err, result) => {
        if (err) {
          console.error('Error POST usuario:', err);
          return res.status(500).json({ error: 'Error al crear usuario' });
        }

        res.status(201).json({
          message: 'Usuario creado correctamente',
          id: result.insertId
        });
      }
    );
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/* ============================
   PUT - Actualizar usuario (sin cambiar password)
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    username,
    rol,
    activo
  } = req.body;

  const sql = `
    UPDATE usuarios
    SET nombre = ?,
        apellido_paterno = ?,
        apellido_materno = ?,
        username = ?,
        rol = ?,
        activo = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      apellido_paterno,
      apellido_materno || null,
      username,
      rol,
      activo,
      id
    ],
    (err, result) => {
      if (err) {
        console.error('Error PUT usuario:', err);
        return res.status(500).json({ error: 'Error al actualizar usuario' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario actualizado correctamente' });
    }
  );
});

/* ============================
   DELETE - Eliminar usuario
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM usuarios WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE usuario:', err);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  });
});

module.exports = router;