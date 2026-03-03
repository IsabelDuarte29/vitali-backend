const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Todos los valores
============================ */
router.get('/', (req, res) => {
  const sql = `
    SELECT * FROM analitos_valores_referencia
    ORDER BY id_valor DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET valores referencia:', err);
      return res.status(500).json({ error: 'Error al obtener valores' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Por analito
============================ */
router.get('/analito/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT * FROM analitos_valores_referencia
    WHERE id_analito = ?
    ORDER BY edad_min ASC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET valores por analito:', err);
      return res.status(500).json({ error: 'Error al obtener valores del analito' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Buscar VR específico (edad + sexo)
============================ */
router.get('/buscar/:id_analito', (req, res) => {
  const { id_analito } = req.params;
  const { edad, unidad_edad, sexo } = req.query;

  const sql = `
    SELECT * FROM analitos_valores_referencia
    WHERE id_analito = ?
    AND (sexo = ? OR sexo IS NULL)
    AND (unidad_edad = ? OR unidad_edad IS NULL)
    AND (? BETWEEN edad_min AND edad_max)
    LIMIT 1
  `;

  db.query(
    sql,
    [id_analito, sexo || null, unidad_edad || null, edad || 0],
    (err, results) => {
      if (err) {
        console.error('Error GET VR específico:', err);
        return res.status(500).json({ error: 'Error al buscar valor referencia' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No se encontró valor de referencia' });
      }

      res.json(results[0]);
    }
  );
});

/* ============================
   POST - Crear valor referencia
============================ */
router.post('/', (req, res) => {
  const {
    id_analito,
    edad_min,
    edad_max,
    unidad_edad,
    sexo,
    vr_min,
    vr_max
  } = req.body;

  if (!id_analito) {
    return res.status(400).json({
      error: 'id_analito es obligatorio'
    });
  }

  const sql = `
    INSERT INTO analitos_valores_referencia
    (id_analito, edad_min, edad_max, unidad_edad, sexo, vr_min, vr_max)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id_analito,
      edad_min || null,
      edad_max || null,
      unidad_edad || null,
      sexo || null,
      vr_min || null,
      vr_max || null
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST valor referencia:', err);
        return res.status(500).json({ error: 'Error al crear valor referencia' });
      }

      res.status(201).json({
        message: 'Valor referencia creado correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE analitos_valores_referencia
    SET ?
    WHERE id_valor = ?
  `;

  db.query(sql, [datos, id], (err, result) => {
    if (err) {
      console.error('Error PUT valor referencia:', err);
      return res.status(500).json({ error: 'Error al actualizar valor referencia' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Valor no encontrado' });
    }

    res.json({ message: 'Valor referencia actualizado correctamente' });
  });
});

/* ============================
   DELETE
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM analitos_valores_referencia
    WHERE id_valor = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE valor referencia:', err);
      return res.status(500).json({ error: 'Error al eliminar valor referencia' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Valor no encontrado' });
    }

    res.json({ message: 'Valor referencia eliminado correctamente' });
  });
});

module.exports = router;