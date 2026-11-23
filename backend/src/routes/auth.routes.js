
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const router = express.Router();

// Inicio de sesión
router.post('/login', (req, res) => {
  try {
    const { correo, password } = req.body || {};

    // Validar los datos ingresados
    if (typeof correo !== 'string' ||
        typeof password !== 'string' ||
        !correo.trim() || !password) {
      return res.status(400).json({
        mensaje: 'Ingrese el correo y la contraseña'
      });
    }

    // Buscar usuario en la base de datos
    const usuario = db.prepare(
      'SELECT * FROM usuarios WHERE correo = ?'
    ).get(correo.trim());

    // Verificar que el usuario exista y esté activo
    if (!usuario || usuario.activo !== 1) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    // Comprobar la contraseña
    const passwordCorrecta = bcrypt.compareSync(
      password,
      usuario.password_hash
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    // Verificar la configuración de JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('Falta configurar JWT_SECRET');
    }

    // Generar el token de autenticación
    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Devolver los datos del usuario
    res.json({
      mensaje: 'Inicio de sesión correcto',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error.message);

    res.status(500).json({
      mensaje: 'Error al iniciar sesión'
    });
  }
});

module.exports = router;
