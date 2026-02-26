const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Obtener todos los pacientes
============================ */
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM pacientes ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error GET pacientes:', err);
      return res.status(500).json({ error: 'Error al obtener pacientes' });
    }

    res.status(200).json(results);
  });
});

/* ============================
   GET - Obtener paciente por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM pacientes WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error GET paciente por ID:', err);
      return res.status(500).json({ error: 'Error al buscar paciente' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.status(200).json(results[0]);
  });
});

/* ============================
   POST - Crear paciente
============================ */
router.post('/', (req, res) => {
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    sexo,
    telefono,
    domicilio,
    email
  } = req.body;

  // Validación básica
  if (!nombre || !apellido_paterno || !fecha_nacimiento || !sexo) {
    return res.status(400).json({
      error: 'Nombre, apellido_paterno, fecha_nacimiento y sexo son obligatorios'
    });
  }

  const sql = `
    INSERT INTO pacientes
    (nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, domicilio, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nombre,
      apellido_paterno,
      apellido_materno || null,
      fecha_nacimiento,
      sexo,
      telefono || null,
      domicilio || null,
      email || null
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error POST paciente:', err);
        return res.status(500).json({ error: 'Error al agregar paciente' });
      }

      res.status(201).json({
        message: 'Paciente agregado correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar paciente
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    sexo,
    telefono,
    domicilio,
    email
  } = req.body;

  const sql = `
    UPDATE pacientes
    SET nombre = ?,
        apellido_paterno = ?,
        apellido_materno = ?,
        fecha_nacimiento = ?,
        sexo = ?,
        telefono = ?,
        domicilio = ?,
        email = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      apellido_paterno,
      apellido_materno || null,
      fecha_nacimiento,
      sexo,
      telefono || null,
      domicilio || null,
      email || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error PUT paciente:', err);
        return res.status(500).json({ error: 'Error al actualizar paciente' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
      }

      res.status(200).json({ message: 'Paciente actualizado correctamente' });
    }
  );
});

/* ============================
   DELETE - Eliminar paciente
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM pacientes WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error DELETE paciente:', err);
      return res.status(500).json({ error: 'Error al eliminar paciente' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.status(200).json({ message: 'Paciente eliminado correctamente' });
  });
});

module.exports = router;