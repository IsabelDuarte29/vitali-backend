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
const usuariosRoutes = require('./routes/usuarios');
const muestrasRoutes = require('./routes/muestras');
const recipientesRoutes = require('./routes/recipientes');
const estudiosRoutes = require('./routes/estudios');
const analitosRoutes = require('./routes/analitos');
const analitosOpcionesRoutes = require('./routes/analitos_opciones');

app.use('/pacientes', pacientesRoutes);
app.use('/doctores', doctoresRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/muestras', muestrasRoutes);
app.use('/recipientes', recipientesRoutes);
app.use('/estudios', estudiosRoutes);
app.use('/analitos', analitosRoutes);
app.use('/analitos-opciones', analitosOpcionesRoutes);

/* ============================
   Ruta base
============================ */
app.get('/', (req, res) => {
  res.json({
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