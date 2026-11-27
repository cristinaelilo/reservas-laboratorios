const db = require('../db/connection');

const listar = ({ rol, busqueda } = {}) => {
    let sql = 'SELECT id, nombre, correo, rol, activo FROM usuarios WHERE 1 = 1';
    const params = [];

    if (rol) {
        sql += ' AND rol = ?';
        params.push(rol);
    }

    if (busqueda) {
        sql += ' AND (nombre LIKE ? OR correo LIKE ?)';
        const termino = `%${busqueda}%`;
        params.push(termino, termino);
    }

    sql += ' ORDER BY nombre ASC';
    return db.prepare(sql).all(...params);
};

const obtenerPorId = (id) =>
    db.prepare('SELECT id, nombre, correo, rol, activo FROM usuarios WHERE id = ?').get(id);

const obtenerPorCorreo = (correo) =>
    db.prepare('SELECT * FROM usuarios WHERE correo = ?').get(correo);

const crear = ({ nombre, correo, password_hash, rol, activo = 1 }) => {
    const info = db
        .prepare(
            `INSERT INTO usuarios (nombre, correo, password_hash, rol, activo)
       VALUES (?, ?, ?, ?, ?)`
        )
        .run(nombre, correo, password_hash, rol, activo);

    return obtenerPorId(info.lastInsertRowid);
};

const actualizar = (id, datos) => {
    const actual = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
    if (!actual) return null;

    const nuevo = { ...actual, ...datos };
    db.prepare(
        `UPDATE usuarios SET nombre = ?, correo = ?, password_hash = ?, rol = ?, activo = ? WHERE id = ?`
    ).run(nuevo.nombre, nuevo.correo, nuevo.password_hash, nuevo.rol, nuevo.activo, id);

    return obtenerPorId(id);
};

const cambiarEstado = (id, activo) => {
    const info = db.prepare('UPDATE usuarios SET activo = ? WHERE id = ?').run(activo ? 1 : 0, id);
    if (info.changes === 0) return null;
    return obtenerPorId(id);
};

module.exports = {
    listar,
    obtenerPorId,
    obtenerPorCorreo,
    crear,
    actualizar,
    cambiarEstado,
};