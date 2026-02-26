// backend/db.js
const mysql = require('mysql2');

// Configura tu conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',      // normalmente localhost si es tu computadora
  user: 'root',           // tu usuario de MySQL
  password: 'isa99beideUG*',  // tu contraseña de MySQL
  database: 'lab'  // el nombre de tu base de datos
});

// Probar la conexión
db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Exportamos la conexión para usarla en otros archivos
module.exports = db;