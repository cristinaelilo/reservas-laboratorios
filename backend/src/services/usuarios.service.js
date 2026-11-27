const bcrypt = require('bcryptjs');
const usuariosRepo = require('../repositories/usuarios.repo');

const ROLES_VALIDOS = ['ADMIN', 'DOCENTE', 'ESTUDIANTE'];

const listarUsuarios = (filtros) => {
    return usuariosRepo.listar(filtros);
};

const obtenerUsuario = (id) => {
    const usuario = usuariosRepo.obtenerPorId(id);
    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }
    return usuario;
};

const crearUsuario = async ({ nombre, correo, password, rol }) => {
    if (!nombre || !correo || !password || !rol) {
        const error = new Error('Nombre, correo, contraseña y rol son obligatorios');
        error.status = 400;
        throw error;
    }

    const validarRol = rol.toUpperCase();
    if (!ROLES_VALIDOS.includes(rolNormalizado)) {
        const error = new Error('Rol no válido. Debe ser ADMIN, DOCENTE o ESTUDIANTE');
        error.status = 400;
        throw error;
    }

    const existente = usuariosRepo.obtenerPorCorreo(correo.trim().toLowerCase());
    if (existente) {
        const error = new Error('Ya existe un usuario registrado con ese correo');
        error.status = 409;
        throw error;
    }

    const password_hash = await bcrypt.hash(password, 10);

    return usuariosRepo.crear({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        password_hash,
        rol: validarRol,
        activo: 1,
    });
};

const actualizarUsuario = async (id, { nombre, correo, password, rol, activo }) => {
    const actual = obtenerUsuario(id);
    const datosActualizar = {};

    if (nombre !== undefined) datosActualizar.nombre = nombre.trim();

    if (correo !== undefined) {
        const correoLimpio = correo.trim().toLowerCase();
        const otro = usuariosRepo.obtenerPorCorreo(correoLimpio);
        if (otro && otro.id !== Number(id)) {
            const error = new Error('El correo ya está asignado a otro usuario');
            error.status = 409;
            throw error;
        }
        datosActualizar.correo = correoLimpio;
    }

    if (rol !== undefined) {
        const rolValidado = rol.toUpperCase();
        if (!ROLES_VALIDOS.includes(rolValidado)) {
            const error = new Error('Rol no válido');
            error.status = 400;
            throw error;
        }
        datosActualizar.rol = rolValidado;
    }

    if (password) {
        datosActualizar.password_hash = await bcrypt.hash(password, 10);
    }

    if (activo !== undefined) {
        datosActualizar.activo = activo ? 1 : 0;
    }

    return usuariosRepo.actualizar(actual.id, datosActualizar);
};

const cambiarEstadoUsuario = (id, activo) => {
    obtenerUsuario(id);
    if (activo === undefined || (activo !== 0 && activo !== 1 && typeof activo !== 'boolean')) {
        const error = new Error('El campo activo debe ser booleano o 0/1');
        error.status = 400;
        throw error;
    }
    return usuariosRepo.cambiarEstado(id, activo);
};

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    cambiarEstadoUsuario,
};