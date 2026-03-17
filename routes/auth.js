const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/jwt');

/* ===============================
   LOGIN
================================ */

router.post('/login', (req, res) => {

  const { username, password } = req.body;

  const sql = `
    SELECT *
    FROM usuarios
    WHERE username = ?
    AND activo = 1
  `;

  db.query(sql, [username], async (err, rows) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = rows[0];

    const passwordValido = await bcrypt.compare(password, user.password_hash);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        rol: user.rol
      },
      config.secret,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login correcto',
      token
    });

  });

});

module.exports = router;