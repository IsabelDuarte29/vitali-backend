const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todos los recipientes
============================ */
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM recipientes ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET recipientes:', err);
      return res.status(500).json({ error: 'Error al obtener recipientes' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Recipiente por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM recipientes WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET recipiente:', err);
      return res.status(500).json({ error: 'Error al buscar recipiente' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Recipiente no encontrado' });
    }

    res.json(results[0]);
  });
});

/* ============================
   POST - Crear recipiente
============================ */
router.post('/', (req, res) => {
  const { nombre, observaciones } = req.body;

  if (!nombre) {
    return res.status(400).json({
      error: 'El campo nombre es obligatorio'
    });
  }

  const sql = `
    INSERT INTO recipientes (nombre, observaciones)
    VALUES (?, ?)
  `;

  db.query(
    sql,
    [
      nombre,
      observaciones || 'Sin Observaciones'
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST recipiente:', err);
        return res.status(500).json({ error: 'Error al crear recipiente' });
      }

      res.status(201).json({
        message: 'Recipiente creado correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar recipiente
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, observaciones } = req.body;

  if (!nombre) {
    return res.status(400).json({
      error: 'El campo nombre es obligatorio'
    });
  }

  const sql = `
    UPDATE recipientes
    SET nombre = ?, observaciones = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      observaciones || 'Sin Observaciones',
      id
    ],
    (err, result) => {
      if (err) {
        console.error('Error PUT recipiente:', err);
        return res.status(500).json({ error: 'Error al actualizar recipiente' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Recipiente no encontrado' });
      }

      res.json({ message: 'Recipiente actualizado correctamente' });
    }
  );
});

/* ============================
   DELETE - Eliminar recipiente
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM recipientes WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE recipiente:', err);
      return res.status(500).json({ error: 'Error al eliminar recipiente' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipiente no encontrado' });
    }

    res.json({ message: 'Recipiente eliminado correctamente' });
  });
});

module.exports = router;