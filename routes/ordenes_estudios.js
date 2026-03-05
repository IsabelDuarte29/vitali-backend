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

  const { id_orden, id_estudio } = req.body;

  if (!id_orden || !id_estudio) {
    return res.status(400).json({
      error: 'id_orden e id_estudio son obligatorios'
    });
  }

  /* ============================
     1. Obtener precio y dias_proceso del estudio
  ============================ */

  const sqlEstudio = `
    SELECT precio, dias_proceso
    FROM estudios
    WHERE id_estudio = ?
  `;

  db.query(sqlEstudio, [id_estudio], (err, estudio) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error obteniendo estudio' });
    }

    if (estudio.length === 0) {
      return res.status(404).json({
        error: 'Estudio no encontrado'
      });
    }

    const precio = estudio[0].precio;
    const dias = estudio[0].dias_proceso;

    /* ============================
       2. Insertar estudio en la orden
    ============================ */

    const sqlInsert = `
      INSERT INTO ordenes_estudios
      (id_orden, id_estudio, precio, dias_proceso)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sqlInsert, [id_orden, id_estudio, precio, dias], (err) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Error agregando estudio'
        });
      }

      /* ============================
         3. Obtener analitos del estudio
      ============================ */

      const sqlAnalitos = `
        SELECT id_analito
        FROM estudios_analitos
        WHERE id_estudio = ?
        ORDER BY orden ASC
      `;

      db.query(sqlAnalitos, [id_estudio], (err, analitos) => {

        if (err) {
          console.error(err);
          return res.status(500).json({
            error: 'Error obteniendo analitos'
          });
        }

        if (analitos.length === 0) {
          return res.json({
            message: 'Estudio agregado pero no tiene analitos'
          });
        }

        /* ============================
           4. Crear resultados automáticamente
        ============================ */

        const valores = analitos.map(a => [
          id_orden,
          id_estudio,
          a.id_analito
        ]);

        const sqlResultados = `
          INSERT INTO resultados
          (id_orden, id_estudio, id_analito)
          VALUES ?
        `;

        db.query(sqlResultados, [valores], (err) => {

          if (err) {
            console.error(err);
            return res.status(500).json({
              error: 'Error generando resultados'
            });
          }

          res.status(201).json({
            message: 'Estudio agregado y analitos generados automáticamente'
          });

        });

      });

    });

  });

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