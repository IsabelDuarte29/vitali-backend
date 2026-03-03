const express = require('express');
const router = express.Router();
const db = require('../db');

/* ============================
   GET - Resultados por orden
============================ */
router.get('/orden/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT r.*, 
           a.nombre_analito,
           a.tipo_resultado,
           a.unidad,
           ao.opcion
    FROM resultados r
    JOIN analitos a ON r.id_analito = a.id_analito
    LEFT JOIN analitos_opciones ao ON r.id_opcion = ao.id_opcion
    WHERE r.id_orden = ?
    ORDER BY r.id_estudio, a.nombre_analito
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET resultados:', err);
      return res.status(500).json({ error: 'Error al obtener resultados' });
    }

    res.json(results);
  });
});

/* ============================
   POST - Guardar resultado
============================ */
router.post('/', (req, res) => {
  const {
    id_orden,
    id_estudio,
    id_analito,
    id_opcion,
    valor_numerico,
    valor_texto
  } = req.body;

  if (!id_orden || !id_estudio || !id_analito) {
    return res.status(400).json({
      error: 'id_orden, id_estudio e id_analito son obligatorios'
    });
  }

  const sql = `
    INSERT INTO resultados
    (id_orden, id_estudio, id_analito, id_opcion, valor_numerico, valor_texto)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id_orden,
      id_estudio,
      id_analito,
      id_opcion || null,
      valor_numerico || null,
      valor_texto || null
    ],
    (err, result) => {
      if (err) {
        console.error('Error POST resultado:', err);
        return res.status(500).json({ error: 'Error al guardar resultado' });
      }

      res.status(201).json({
        message: 'Resultado guardado correctamente',
        id: result.insertId
      });
    }
  );
});

/* ============================
   PUT - Actualizar resultado
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE resultados
    SET ?
    WHERE id_resultado = ?
  `;

  db.query(sql, [datos, id], (err, result) => {
    if (err) {
      console.error('Error PUT resultado:', err);
      return res.status(500).json({ error: 'Error al actualizar resultado' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resultado no encontrado' });
    }

    res.json({ message: 'Resultado actualizado correctamente' });
  });
});

/* ============================
   PATCH - Validar resultado
============================ */
router.patch('/:id/validar', (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE resultados
    SET validado = 1
    WHERE id_resultado = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error PATCH validar:', err);
      return res.status(500).json({ error: 'Error al validar resultado' });
    }

    res.json({ message: 'Resultado validado correctamente' });
  });
});

/* ============================
   DELETE
============================ */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM resultados
    WHERE id_resultado = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error DELETE resultado:', err);
      return res.status(500).json({ error: 'Error al eliminar resultado' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resultado no encontrado' });
    }

    res.json({ message: 'Resultado eliminado correctamente' });
  });
});

module.exports = router;