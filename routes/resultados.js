const express = require('express');
const router = express.Router();
const db = require('../db');

/* ==========================================
   FUNCIÓN EVALUAR VALORES DE REFERENCIA
========================================== */

function evaluarVR(db, { id_orden, id_analito, valor_numerico }, callback) {

  if (valor_numerico === null || valor_numerico === undefined) {
    return callback(null, { clasificacion: null, vr: null });
  }

  const valor = Number(valor_numerico);

  const sqlPaciente = `
    SELECT p.fecha_nacimiento, p.sexo
    FROM ordenes o
    JOIN pacientes p ON o.id_paciente = p.id
    WHERE o.id_orden = ?
  `;

  db.query(sqlPaciente, [id_orden], (err, rows) => {

    if (err) return callback(err);

    if (rows.length === 0) {
      return callback(null, { clasificacion: 'SIN_VR', vr: null });
    }

    const { fecha_nacimiento, sexo } = rows[0];

    const hoy = new Date();
    const nacimiento = new Date(fecha_nacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    const sqlVR = `
      SELECT vr_min, vr_max
      FROM analitos_valores_referencia
      WHERE id_analito = ?
      AND (sexo = ? OR sexo IS NULL)
      AND (edad_min IS NULL OR edad_min <= ?)
      AND (edad_max IS NULL OR edad_max >= ?)
      LIMIT 1
    `;

    db.query(sqlVR, [id_analito, sexo, edad, edad], (err, vrRows) => {

      if (err) return callback(err);

      if (vrRows.length === 0) {
        return callback(null, { clasificacion: 'SIN_VR', vr: null });
      }

      const vr_min = vrRows[0].vr_min !== null ? Number(vrRows[0].vr_min) : null;
      const vr_max = vrRows[0].vr_max !== null ? Number(vrRows[0].vr_max) : null;

      let clasificacion = 'NORMAL';

      if (vr_min !== null && valor < vr_min) clasificacion = 'BAJO';
      if (vr_max !== null && valor > vr_max) clasificacion = 'ALTO';

      callback(null, {
        clasificacion,
        vr: { vr_min, vr_max }
      });

    });

  });

}

/* ==========================================
   ACTUALIZAR ESTADO DE LA ORDEN
========================================== */

function actualizarEstadoOrden(id_orden) {

  const sql = `
    SELECT
      COUNT(*) total,
      SUM(CASE WHEN estatus='PENDIENTE' THEN 1 ELSE 0 END) pendientes,
      SUM(CASE WHEN estatus='EN_PROCESO' THEN 1 ELSE 0 END) proceso,
      SUM(CASE WHEN estatus='CAPTURADO' THEN 1 ELSE 0 END) capturados,
      SUM(CASE WHEN estatus='VALIDADO' THEN 1 ELSE 0 END) validados
    FROM ordenes_estudios
    WHERE id_orden = ?
  `;

  db.query(sql, [id_orden], (err, rows) => {

    if (err) {
      console.error(err);
      return;
    }

    const { total, pendientes, proceso, capturados, validados } = rows[0];

    let estatus = 'PENDIENTE';

    if (proceso > 0) {
      estatus = 'EN_PROCESO';
    }

    if (capturados === total && total > 0) {
      estatus = 'CAPTURADO';
    }

    if (validados === total && total > 0) {
      estatus = 'VALIDADO';
    }

    const sqlUpdate = `
      UPDATE ordenes
      SET estatus = ?
      WHERE id_orden = ?
    `;

    db.query(sqlUpdate, [estatus, id_orden]);

  });

}

/* ==========================================
   ACTUALIZAR ESTADO DEL ESTUDIO
========================================== */

function actualizarEstadoEstudio(id_orden, id_estudio) {

  const sql = `
    SELECT
      COUNT(*) total,
      SUM(
        CASE
          WHEN valor_numerico IS NOT NULL
            OR valor_texto IS NOT NULL
            OR id_opcion IS NOT NULL
          THEN 1 ELSE 0
        END
      ) capturados,
      SUM(
        CASE
          WHEN validado = 1
          THEN 1 ELSE 0
        END
      ) validados
    FROM resultados
    WHERE id_orden = ?
    AND id_estudio = ?
  `;

  db.query(sql, [id_orden, id_estudio], (err, rows) => {

    if (err) {
      console.error(err);
      return;
    }

    const { total, capturados, validados } = rows[0];

    let estatus = 'PENDIENTE';

    if (capturados > 0 && capturados < total) {
      estatus = 'EN_PROCESO';
    }

    if (capturados === total && total > 0) {
      estatus = 'CAPTURADO';
    }

    if (validados === total && total > 0) {
      estatus = 'VALIDADO';
    }

    const sqlUpdate = `
      UPDATE ordenes_estudios
      SET estatus = ?
      WHERE id_orden = ?
      AND id_estudio = ?
    `;

    db.query(sqlUpdate, [estatus, id_orden, id_estudio], (err) => {

      if (err) console.error(err);

      actualizarEstadoOrden(id_orden);

    });

  });

}

/* ==========================================
   GET RESULTADOS POR ORDEN
========================================== */

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
      console.error(err);
      return res.status(500).json({ error: 'Error obteniendo resultados' });
    }

    res.json(results);

  });

});

/* ==========================================
   PUT ACTUALIZAR RESULTADO
========================================== */

router.put('/:id', (req, res) => {

  const { id } = req.params;
  const datos = req.body;

  const sqlUpdate = `
    UPDATE resultados
    SET ?
    WHERE id_resultado = ?
  `;

  db.query(sqlUpdate, [datos, id], (err) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error actualizando resultado' });
    }

    const sqlGet = `
      SELECT r.id_orden, r.id_estudio, r.id_analito, r.valor_numerico,
             r.id_opcion, a.tipo_resultado
      FROM resultados r
      JOIN analitos a ON r.id_analito = a.id_analito
      WHERE r.id_resultado = ?
    `;

    db.query(sqlGet, [id], (err, rows) => {

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Resultado no encontrado' });
      }

      const resultado = rows[0];

      const tipo = resultado.tipo_resultado
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

      if (tipo === 'NUMERICO' || tipo === 'REFERENCIADO') {

        evaluarVR(db, resultado, (err, evaluacion) => {

          const clasificacion = evaluacion.clasificacion;

          db.query(
            `UPDATE resultados SET clasificacion = ? WHERE id_resultado = ?`,
            [clasificacion, id]
          );

          actualizarEstadoEstudio(resultado.id_orden, resultado.id_estudio);

          return res.json({
            message: 'Resultado actualizado',
            evaluacion_vr: evaluacion
          });

        });

      }

      else if (tipo === 'SELECCION') {

        const sqlOpcion = `
          SELECT es_anormal
          FROM analitos_opciones
          WHERE id_opcion = ?
        `;

        db.query(sqlOpcion, [resultado.id_opcion], (err, opcion) => {

          let clasificacion = 'NORMAL';

          if (opcion.length > 0 && opcion[0].es_anormal === 1) {
            clasificacion = 'ANORMAL';
          }

          db.query(
            `UPDATE resultados SET clasificacion = ? WHERE id_resultado = ?`,
            [clasificacion, id]
          );

          actualizarEstadoEstudio(resultado.id_orden, resultado.id_estudio);

          res.json({
            message: 'Resultado actualizado',
            clasificacion
          });

        });

      }

      else {

        actualizarEstadoEstudio(resultado.id_orden, resultado.id_estudio);

        res.json({
          message: 'Resultado actualizado'
        });

      }

    });

  });

});

/* ==========================================
   VALIDAR RESULTADO
========================================== */

router.patch('/:id/validar', (req, res) => {

  const { id } = req.params;

  const sql = `
    UPDATE resultados
    SET validado = 1
    WHERE id_resultado = ?
  `;

  db.query(sql, [id], (err) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error validando resultado' });
    }

    const sqlGet = `
      SELECT id_orden, id_estudio
      FROM resultados
      WHERE id_resultado = ?
    `;

    db.query(sqlGet, [id], (err, rows) => {

      if (rows.length > 0) {
        const { id_orden, id_estudio } = rows[0];
        actualizarEstadoEstudio(id_orden, id_estudio);
      }

      res.json({
        message: 'Resultado validado'
      });

    });

  });

});

module.exports = router;