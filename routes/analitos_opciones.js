const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todas las opciones
============================ */
router.get('/', (req, res) => {
  const sql = `
    SELECT * FROM analitos_opciones
    ORDER BY id_opcion DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET opciones:', err);
      return res.status(500).json({ error: 'Error al obtener opciones' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Opciones por analito
============================ */
router.get('/analito/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT * FROM analitos_opciones
    WHERE id_analito = ? AND activo = 1
    ORDER BY orden ASC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET opciones por analito:', err);
      return res.status(500).json({ error: 'Error al obtener opciones del analito' });
    }

    res.json(results);
  });
});

/* ============================
   POST - Crear opción
============================ */
router.post('/', (req, res) => {
  const { id_analito, opcion, es_anormal, orden } = req.body;

  if (!id_analito || !opcion) {
    return res.status(400).json({
      error: 'id_analito y opcion son obligatorios'
    });
  }

  const sql = `
    INSERT INTO analitos_opciones
    (id_analito, opcion, es_anormal, orden)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id_analito,
      opcion,
      es_anormal || 0,
      orden || null
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST opción:', err);
        return res.status(500).json({ error: 'Error al crear opción' });
      }

      res.status(201).json({
        message: 'Opción creada correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar opción
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE analitos_opciones
    SET ?
    WHERE id_opcion = ?
  `;

  db.query(sql, [datos, id], (err, result) => {
    if (err) {
      console.error('Error PUT opción:', err);
      return res.status(500).json({ error: 'Error al actualizar opción' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Opción no encontrada' });
    }

    res.json({ message: 'Opción actualizada correctamente' });
  });
});

/* ============================
   PATCH - Activar / Desactivar
============================ */
router.patch('/:id/estado', (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  const sql = `
    UPDATE analitos_opciones
    SET activo = ?
    WHERE id_opcion = ?
  `;

  db.query(sql, [activo, id], (err) => {
    if (err) {
      console.error('Error PATCH opción:', err);
      return res.status(500).json({ error: 'Error al actualizar estado' });
    }

    res.json({ message: 'Estado actualizado correctamente' });
  });
});

/* ============================
   DELETE - (Opcional)
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM analitos_opciones
    WHERE id_opcion = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE opción:', err);
      return res.status(500).json({ error: 'Error al eliminar opción' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Opción no encontrada' });
    }

    res.json({ message: 'Opción eliminada correctamente' });
  });
});

module.exports = router;