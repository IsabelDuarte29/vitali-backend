const express = require('express');
const cors = require('cors');

const app = express();

/* ============================
   Middlewares
============================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================
   Rutas
============================ */
const pacientesRoutes = require('./routes/pacientes');
const doctoresRoutes = require('./routes/doctores');

app.use('/pacientes', pacientesRoutes);
app.use('/doctores', doctoresRoutes);

/* ============================
   Ruta base
============================ */
app.get('/', (req, res) => {
  res.status(200).json({
    sistema: 'API Laboratorio Clínico',
    estado: 'Activo'
  });
});

/* ============================
   404
============================ */
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

/* ============================
   Puerto
============================ */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});