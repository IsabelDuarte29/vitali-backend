const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todos los analitos
============================ */
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM analitos ORDER BY id_analito DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET analitos:', err);
      return res.status(500).json({ error: 'Error al obtener analitos' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Solo activos
============================ */
router.get('/activos/lista', (req, res) => {
  const sql = 'SELECT * FROM analitos WHERE activo = 1 ORDER BY nombre_analito ASC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET analitos activos:', err);
      return res.status(500).json({ error: 'Error al obtener analitos activos' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Analito por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM analitos WHERE id_analito = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET analito:', err);
      return res.status(500).json({ error: 'Error al buscar analito' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Analito no encontrado' });
    }

    res.json(results[0]);
  });
});

/* ============================
   POST - Crear analito
============================ */
router.post('/', (req, res) => {
  const {
    clave,
    nombre_analito,
    tipo_resultado,
    unidad,
    resultado_defecto,
    decimales
  } = req.body;

  if (!clave || !nombre_analito || !tipo_resultado) {
    return res.status(400).json({
      error: 'Clave, nombre y tipo_resultado son obligatorios'
    });
  }

  const sql = `
    INSERT INTO analitos (
      clave,
      nombre_analito,
      tipo_resultado,
      unidad,
      resultado_defecto,
      decimales
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      clave,
      nombre_analito,
      tipo_resultado,
      unidad,
      resultado_defecto,
      decimales
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST analito:', err);
        return res.status(500).json({ error: 'Error al crear analito' });
      }

      res.status(201).json({
        message: 'Analito creado correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar analito
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE analitos SET ?
    WHERE id_analito = ?
  `;

  db.query(sql, [datos, id], (err, result) => {
    if (err) {
      console.error('Error PUT analito:', err);
      return res.status(500).json({ error: 'Error al actualizar analito' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Analito no encontrado' });
    }

    res.json({ message: 'Analito actualizado correctamente' });
  });
});

/* ============================
   PATCH - Activar / Desactivar
============================ */
router.patch('/:id/estado', (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  const sql = `
    UPDATE analitos
    SET activo = ?
    WHERE id_analito = ?
  `;

  db.query(sql, [activo, id], (err) => {
    if (err) {
      console.error('Error PATCH analito:', err);
      return res.status(500).json({ error: 'Error al actualizar estado' });
    }

    res.json({ message: 'Estado actualizado correctamente' });
  });
});

module.exports = router;