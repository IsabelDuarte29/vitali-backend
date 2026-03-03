const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todos los estudios de todas las órdenes
============================ */
router.get('/', (req, res) => {
  const sql = `
    SELECT oe.*, 
           e.nombre_estudio,
           o.folio
    FROM ordenes_estudios oe
    JOIN estudios e ON oe.id_estudio = e.id_estudio
    JOIN ordenes o ON oe.id_orden = o.id_orden
    ORDER BY oe.fecha_alta DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET ordenes_estudios:', err);
      return res.status(500).json({ error: 'Error al obtener registros' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Estudios por orden
============================ */
router.get('/orden/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT oe.*, e.nombre_estudio
    FROM ordenes_estudios oe
    JOIN estudios e ON oe.id_estudio = e.id_estudio
    WHERE oe.id_orden = ?
    ORDER BY oe.fecha_alta ASC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET estudios por orden:', err);
      return res.status(500).json({ error: 'Error al obtener estudios de la orden' });
    }

    res.json(results);
  });
});

/* ============================
   POST - Agregar estudio a orden
============================ */
router.post('/', (req, res) => {
  const {
    id_orden,
    id_estudio,
    precio,
    dias_proceso
  } = req.body;

  if (!id_orden || !id_estudio || !precio || !dias_proceso) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios'
    });
  }

  const sql = `
    INSERT INTO ordenes_estudios
    (id_orden, id_estudio, precio, dias_proceso)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [id_orden, id_estudio, precio, dias_proceso],
    (err, result) => {
      if (err) {
        console.error('Error POST orden_estudio:', err);
        return res.status(500).json({ error: 'Error al agregar estudio a la orden' });
      }

      res.status(201).json({
        message: 'Estudio agregado a la orden',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PATCH - Cambiar estatus
============================ */
router.patch('/:id/estatus', (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;

  const sql = `
    UPDATE ordenes_estudios
    SET estatus = ?
    WHERE id_orden_estudio = ?
  `;

  db.query(sql, [estatus, id], (err) => {
    if (err) {
      console.error('Error PATCH estatus estudio:', err);
      return res.status(500).json({ error: 'Error al actualizar estatus' });
    }

    res.json({ message: 'Estatus actualizado correctamente' });
  });
});

/* ============================
   DELETE - Quitar estudio de orden
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM ordenes_estudios
    WHERE id_orden_estudio = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE orden_estudio:', err);
      return res.status(500).json({ error: 'Error al eliminar estudio' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.json({ message: 'Estudio eliminado de la orden' });
  });
});

module.exports = router;