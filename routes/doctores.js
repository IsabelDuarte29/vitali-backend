const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Obtener todos los doctores
============================ */
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM doctores ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error GET doctores:', err);
      return res.status(500).json({ error: 'Error al obtener doctores' });
    }

    res.status(200).json(results);
  });
});

/* ============================
   GET - Obtener doctor por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM doctores WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error GET doctor por ID:', err);
      return res.status(500).json({ error: 'Error al buscar doctor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }

    res.status(200).json(results[0]);
  });
});

/* ============================
   POST - Crear doctor
============================ */
router.post('/', (req, res) => {
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    email
  } = req.body;

  if (!nombre || !apellido_paterno) {
    return res.status(400).json({
      error: 'Nombre y apellido_paterno son obligatorios'
    });
  }

  const sql = `
    INSERT INTO doctores
    (nombre, apellido_paterno, apellido_materno, telefono, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nombre,
      apellido_paterno,
      apellido_materno || null,
      telefono || null,
      email || null
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error POST doctor:', err);
        return res.status(500).json({ error: 'Error al crear doctor' });
      }

      res.status(201).json({
        message: 'Doctor creado correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar doctor
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    email
  } = req.body;

  const sql = `
    UPDATE doctores
    SET nombre = ?,
        apellido_paterno = ?,
        apellido_materno = ?,
        telefono = ?,
        email = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      apellido_paterno,
      apellido_materno || null,
      telefono || null,
      email || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error PUT doctor:', err);
        return res.status(500).json({ error: 'Error al actualizar doctor' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Doctor no encontrado' });
      }

      res.status(200).json({ message: 'Doctor actualizado correctamente' });
    }
  );
});

/* ============================
   DELETE - Eliminar doctor
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM doctores WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error DELETE doctor:', err);
      return res.status(500).json({ error: 'Error al eliminar doctor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }

    res.status(200).json({ message: 'Doctor eliminado correctamente' });
  });
});

module.exports = router;