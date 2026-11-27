const express = require('express');
const service = require('../services/laboratorios.service');

const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = express.Router();

// Todas las rutas exigen haber iniciado sesión
router.use(verificarToken);

// Convierte los errores del servicio en respuestas HTTP
const manejar = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    res.status(status).json({ mensaje: status === 500 ? 'Error interno del servidor' : e.message });
  }
};

// Cualquier usuario con sesión puede consultar
router.get('/', manejar((req, res) => res.json(service.listar())));
router.get('/:id', manejar((req, res) => res.json(service.obtener(req.params.id))));

// Solo el Administrador modifica
router.post('/', permitirRoles('ADMIN'), manejar((req, res) => res.status(201).json(service.crear(req.body || {}))));
router.put('/:id', permitirRoles('ADMIN'), manejar((req, res) => res.json(service.actualizar(req.params.id, req.body || {}))));
router.delete('/:id', permitirRoles('ADMIN'), manejar((req, res) => {
  service.eliminar(req.params.id);
  res.status(204).end();
}));

module.exports = router;
