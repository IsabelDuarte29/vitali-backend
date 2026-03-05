const express = require('express');
const router = express.Router();
const db = require('../db');

function generarFolio(callback) {

  const hoy = new Date();

  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = String(hoy.getFullYear()).slice(-2);

  const prefijo = `${dia}${mes}${anio}`;

  const sql = `
    SELECT folio 
    FROM ordenes
    WHERE folio LIKE ?
    ORDER BY folio DESC
    LIMIT 1
  `;

  db.query(sql, [`${prefijo}%`], (err, results) => {

    if (err) return callback(err);

    let consecutivo = 1;

    if (results.length > 0) {
      const ultimo = results[0].folio;
      consecutivo = parseInt(ultimo.slice(-3)) + 1;
    }

    const nuevoFolio = prefijo + String(consecutivo).padStart(3, '0');

    callback(null, nuevoFolio);

  });

}

/* ============================
   GET - Todas las órdenes
============================ */
router.get('/', (req, res) => {
  const sql = `
    SELECT o.*, 
           CONCAT(p.nombre, ' ', p.apellido_paterno) AS paciente,
           CONCAT(d.nombre, ' ', d.apellido_paterno) AS doctor
    FROM ordenes o
    JOIN pacientes p ON o.id_paciente = p.id
    JOIN doctores d ON o.id_doctor = d.id
    ORDER BY o.fecha_orden DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error GET ordenes:', err);
      return res.status(500).json({ error: 'Error al obtener órdenes' });
    }

    res.json(results);
  });
});

/* ============================
   GET - Orden por ID
============================ */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT * FROM ordenes
    WHERE id_orden = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error GET orden:', err);
      return res.status(500).json({ error: 'Error al buscar orden' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(results[0]);
  });
});

/* ============================
   POST - Crear orden
============================ */
router.post('/', (req, res) => {

  const {
    id_paciente,
    id_doctor,
    observaciones,
    id_usuario
  } = req.body;

  if (!id_paciente || !id_doctor || !id_usuario) {
    return res.status(400).json({
      error: 'id_paciente, id_doctor e id_usuario son obligatorios'
    });
  }

  generarFolio((err, folio) => {

    if (err) {
      console.error('Error generando folio:', err);
      return res.status(500).json({ error: 'Error generando folio' });
    }

    const sql = `
      INSERT INTO ordenes
      (folio, id_paciente, id_doctor, observaciones, id_usuario)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        folio,
        id_paciente,
        id_doctor,
        observaciones || 'Sin Observaciones',
        id_usuario
      ],
      (err, result) => {

        if (err) {
          console.error('Error creando orden:', err);
          return res.status(500).json({ error: 'Error al crear orden' });
        }

        res.status(201).json({
          message: 'Orden creada correctamente',
          folio: folio,
          id: result.insertId
        });

      }
    );

  });

});

/* ============================
   PUT - Actualizar orden
============================ */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  const sql = `
    UPDATE ordenes
    SET ?
    WHERE id_orden = ?
  `;

  db.query(sql, [datos, id], (err, result) => {
    if (err) {
      console.error('Error PUT orden:', err);
      return res.status(500).json({ error: 'Error al actualizar orden' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json({ message: 'Orden actualizada correctamente' });
  });
});

/* ============================
   PATCH - Cambiar estatus
============================ */
router.patch('/:id/estatus', (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;

  const sql = `
    UPDATE ordenes
    SET estatus = ?
    WHERE id_orden = ?
  `;

  db.query(sql, [estatus, id], (err) => {
    if (err) {
      console.error('Error PATCH estatus:', err);
      return res.status(500).json({ error: 'Error al actualizar estatus' });
    }

    res.json({ message: 'Estatus actualizado correctamente' });
  });
});

module.exports = router;