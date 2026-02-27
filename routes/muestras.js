const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todas las muestras
============================ */
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM muestras ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET muestras:', err);
      return res.status(500).json({ error: 'Error al obtener muestras' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Muestra por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM muestras WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET muestra:', err);
      return res.status(500).json({ error: 'Error al buscar muestra' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Muestra no encontrada' });
    }

    res.json(results[0]);
  });
});

/* ============================
   POST - Crear muestra
============================ */
router.post('/', (req, res) => {
  const { nombre, observaciones } = req.body;

  if (!nombre) {
    return res.status(400).json({
      error: 'El campo nombre es obligatorio'
    });
  }

  const sql = `
    INSERT INTO muestras (nombre, observaciones)
    VALUES (?, ?)
  `;

  db.query(
    sql,
    [
      nombre,
      observaciones || 'Sin observaciones'
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST muestra:', err);
        return res.status(500).json({ error: 'Error al crear muestra' });
      }

      res.status(201).json({
        message: 'Muestra creada correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar muestra
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
    UPDATE muestras
    SET nombre = ?, observaciones = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      observaciones || 'Sin observaciones',
      id
    ],
    (err, result) => {
      if (err) {
        console.error('Error PUT muestra:', err);
        return res.status(500).json({ error: 'Error al actualizar muestra' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Muestra no encontrada' });
      }

      res.json({ message: 'Muestra actualizada correctamente' });
    }
  );
});

/* ============================
   DELETE - Eliminar muestra
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM muestras WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE muestra:', err);
      return res.status(500).json({ error: 'Error al eliminar muestra' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Muestra no encontrada' });
    }

    res.json({ message: 'Muestra eliminada correctamente' });
  });
});

module.exports = router;