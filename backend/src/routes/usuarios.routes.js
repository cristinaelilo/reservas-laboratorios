const express = require('express');
const service = require('../services/usuarios.service');

const router = express.Router();

// TEMPORAL: reemplazar por el middleware de autenticación y roles cuando D4 esté en main
const autenticar = (req, res, next) => next();
const soloAdmin = (req, res, next) => next();

// Wrapper asíncrono para capturar tanto errores síncronos como promesas rechazadas (bcrypt)
const manejar = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (e) {
        const status = e.status || 500;
        if (status === 500) console.error(e);
        res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : e.message });
    }
};

// Listar usuarios (admite ?rol=DOCENTE&busqueda=brandon)
router.get(
    '/',
    autenticar,
    soloAdmin,
    manejar(async (req, res) => {
        const { rol, busqueda } = req.query;
        const lista = service.listarUsuarios({ rol, busqueda });
        res.json(lista);
    })
);

// Obtener un usuario por ID
router.get(
    '/:id',
    autenticar,
    soloAdmin,
    manejar(async (req, res) => {
        const usuario = service.obtenerUsuario(req.params.id);
        res.json(usuario);
    })
);

// Crear nuevo docente o estudiante
router.post(
    '/',
    autenticar,
    soloAdmin,
    manejar(async (req, res) => {
        const creado = await service.crearUsuario(req.body);
        res.status(201).json(creado);
    })
);

// Editar datos de usuario
router.put(
    '/:id',
    autenticar,
    soloAdmin,
    manejar(async (req, res) => {
        const actualizado = await service.actualizarUsuario(req.params.id, req.body);
        res.json(actualizado);
    })
);

// Activar o desactivar cuenta sin borrar historial
router.patch(
    '/:id/estado',
    autenticar,
    soloAdmin,
    manejar(async (req, res) => {
        const actualizado = service.cambiarEstadoUsuario(req.params.id, req.body.activo);
        res.json(actualizado);
    })
);

module.exports = router;