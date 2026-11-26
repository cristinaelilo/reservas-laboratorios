const express = require('express');
const router = express.Router();

const service = require('../services/equipos.service');

const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

// Manejar los errores
function responderError(res, error) {
  if (!error.status) {
    console.error(error);
  }

  res.status(error.status || 500).json({
    mensaje: error.status
      ? error.message
      : 'Error interno del servidor'
  });
}

// Verificar que el usuario haya iniciado sesion
router.use(verificarToken);

// Listar todos los equipos
router.get('/', (req, res) => {
  try {
    res.json(service.listarEquipos());
  } catch (error) {
    responderError(res, error);
  }
});

// Buscar un equipo por ID
router.get('/:id', (req, res) => {
  try {
    const equipo = service.obtenerEquipo(
      Number(req.params.id)
    );

    res.json(equipo);
  } catch (error) {
    responderError(res, error);
  }
});

// Registrar un equipo
router.post('/', permitirRoles('ADMIN'), (req, res) => {
  try {
    const equipo = service.crearEquipo(req.body || {});

    res.status(201).json({
      mensaje: 'Equipo registrado correctamente',
      equipo
    });
  } catch (error) {
    responderError(res, error);
  }
});

// Actualizar un equipo
router.put('/:id', permitirRoles('ADMIN'), (req, res) => {
  try {
    const equipo = service.actualizarEquipo(
      Number(req.params.id),
      req.body || {}
    );

    res.json({
      mensaje: 'Equipo actualizado correctamente',
      equipo
    });
  } catch (error) {
    responderError(res, error);
  }
});

// Eliminar un equipo
router.delete('/:id', permitirRoles('ADMIN'), (req, res) => {
  try {
    const resultado = service.eliminarEquipo(
      Number(req.params.id)
    );

    res.json(resultado);
  } catch (error) {
    responderError(res, error);
  }
});

module.exports = router;