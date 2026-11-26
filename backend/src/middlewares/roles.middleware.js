// Permitir el acceso según el rol del usuario
function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({
        mensaje: 'Debe iniciar sesión'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para realizar esta acción'
      });
    }

    next();
  };
}

module.exports = permitirRoles;