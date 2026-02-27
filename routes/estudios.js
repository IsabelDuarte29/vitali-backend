const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todos los estudios
============================ */
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM estudios ORDER BY id_estudio DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET estudios:', err);
      return res.status(500).json({ error: 'Error al obtener estudios' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Solo activos
============================ */
router.get('/activos/lista', (req, res) => {
  const sql = 'SELECT * FROM estudios WHERE activo = 1 ORDER BY nombre_estudio ASC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET estudios activos:', err);
      return res.status(500).json({ error: 'Error al obtener estudios activos' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Estudio por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM estudios WHERE id_estudio = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET estudio:', err);
      return res.status(500).json({ error: 'Error al buscar estudio' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Estudio no encontrado' });
    }

    res.json(results[0]);
  });
});

/* ============================
   POST - Crear estudio
============================ */
router.post('/', (req, res) => {
  const {
    clave,
    nombre_estudio,
    area,
    tipo_muestra,
    recipiente,
    metodo,
    tecnica,
    equipo,
    condiciones_paciente,
    dias_proceso,
    precio,
    precio_urgente,
    subrogado,
    laboratorio_subrogado,
    precio_subrogacion,
    precio_competencia
  } = req.body;

  if (!nombre_estudio) {
    return res.status(400).json({
      error: 'El nombre del estudio es obligatorio'
    });
  }

  const sql = `
    INSERT INTO estudios (
      clave, nombre_estudio, area, tipo_muestra, recipiente,
      metodo, tecnica, equipo, condiciones_paciente,
      dias_proceso, precio, precio_urgente,
      subrogado, laboratorio_subrogado,
      precio_subrogacion, precio_competencia
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      clave,
      nombre_estudio,
      area,
      tipo_muestra,
      recipiente,
      metodo,
      tecnica,
      equipo,
      condiciones_paciente,
      dias_proceso,
      precio,
      precio_urgente,
      subrogado || 0,
      laboratorio_subrogado,
      precio_subrogacion,
      precio_competencia
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST estudio:', err);
        return res.status(500).json({ error: 'Error al crear estudio' });
      }

      res.status(201).json({
        message: 'Estudio creado correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar estudio
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE estudios SET ?
    WHERE id_estudio = ?
  `;

  db.query(sql, [datos, id], (err, result) => {
    if (err) {
      console.error('Error PUT estudio:', err);
      return res.status(500).json({ error: 'Error al actualizar estudio' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estudio no encontrado' });
    }

    res.json({ message: 'Estudio actualizado correctamente' });
  });
});

/* ============================
   PATCH - Activar / Desactivar
============================ */
router.patch('/:id/estado', (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  const sql = `
    UPDATE estudios SET activo = ?
    WHERE id_estudio = ?
  `;

  db.query(sql, [activo, id], (err, result) => {
    if (err) {
      console.error('Error PATCH estudio:', err);
      return res.status(500).json({ error: 'Error al actualizar estado' });
    }

    res.json({ message: 'Estado actualizado correctamente' });
  });
});

module.exports = router;