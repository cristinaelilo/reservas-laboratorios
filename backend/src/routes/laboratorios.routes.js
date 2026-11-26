const express = require('express');
const service = require('../services/laboratorios.service');

const router = express.Router();

// TEMPORAL: reemplazar por el middleware de autenticación y roles de D4 (Denisse)
//   const { autenticar } = require('../middleware/auth');
//   const { soloRoles } = require('../middleware/roles');
const autenticar = (req, res, next) => next();
const soloAdmin = (req, res, next) => next();

// Envuelve cada ruta para convertir los errores del servicio en respuestas HTTP
const manejar = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : e.message });
  }
};

// Cualquier usuario con sesión puede consultar
router.get('/', autenticar, manejar((req, res) => res.json(service.listar())));
router.get('/:id', autenticar, manejar((req, res) => res.json(service.obtener(req.params.id))));

// Solo el Administrador modifica
router.post('/', autenticar, soloAdmin, manejar((req, res) => res.status(201).json(service.crear(req.body))));
router.put('/:id', autenticar, soloAdmin, manejar((req, res) => res.json(service.actualizar(req.params.id, req.body))));
router.delete('/:id', autenticar, soloAdmin, manejar((req, res) => {
  service.eliminar(req.params.id);
  res.status(204).end();
}));

module.exports = router;
