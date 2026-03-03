const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todos
============================ */
router.get('/', (req, res) => {
  const sql = `
    SELECT ea.*, e.nombre_estudio, a.nombre_analito
    FROM estudios_analitos ea
    JOIN estudios e ON ea.id_estudio = e.id_estudio
    JOIN analitos a ON ea.id_analito = a.id_analito
    ORDER BY ea.id_estudio, ea.orden
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET estudios_analitos:', err);
      return res.status(500).json({ error: 'Error al obtener relaciones' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Analitos por estudio
============================ */
router.get('/estudio/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT ea.*, a.nombre_analito, a.tipo_resultado, a.unidad
    FROM estudios_analitos ea
    JOIN analitos a ON ea.id_analito = a.id_analito
    WHERE ea.id_estudio = ?
    ORDER BY ea.orden ASC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET analitos por estudio:', err);
      return res.status(500).json({ error: 'Error al obtener analitos del estudio' });
    }

    res.json(results);
  });
});

/* ============================
   POST - Agregar analito a estudio
============================ */
router.post('/', (req, res) => {
  const { id_estudio, id_analito, orden, obligatorio } = req.body;

  if (!id_estudio || !id_analito) {
    return res.status(400).json({
      error: 'id_estudio e id_analito son obligatorios'
    });
  }

  const sql = `
    INSERT INTO estudios_analitos
    (id_estudio, id_analito, orden, obligatorio)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id_estudio,
      id_analito,
      orden || null,
      obligatorio ?? 1
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST estudios_analitos:', err);
        return res.status(500).json({ error: 'Error al agregar analito al estudio' });
      }

      res.status(201).json({
        message: 'Analito agregado al estudio',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar relación
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE estudios_analitos
    SET ?
    WHERE id_estudio_analito = ?
  `;

  db.query(sql, [datos, id], (err, result) => {
    if (err) {
      console.error('Error PUT estudios_analitos:', err);
      return res.status(500).json({ error: 'Error al actualizar relación' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    res.json({ message: 'Relación actualizada correctamente' });
  });
});

/* ============================
   DELETE - Quitar analito de estudio
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM estudios_analitos
    WHERE id_estudio_analito = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE estudios_analitos:', err);
      return res.status(500).json({ error: 'Error al eliminar relación' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    res.json({ message: 'Analito eliminado del estudio' });
  });
});

module.exports = router;