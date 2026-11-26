const jwt = require('jsonwebtoken');
const db = require('../db/connection');

// Verificar que el usuario tenga un token válido
function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Debe iniciar sesión'
    });
  }

  const token = autorizacion.split(' ')[1];

  let datos;

  try {
    datos = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado'
    });
  }

  try {
    const usuario = db.prepare(`
      SELECT id, nombre, correo, rol, activo
      FROM usuarios
      WHERE id = ?
    `).get(datos.id);

    if (!usuario || usuario.activo !== 1) {
      return res.status(401).json({
        mensaje: 'Usuario no autorizado'
      });
    }

    req.usuario = usuario;

    next();

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      mensaje: 'Error al verificar el usuario'
    });
  }
}

module.exports = verificarToken;