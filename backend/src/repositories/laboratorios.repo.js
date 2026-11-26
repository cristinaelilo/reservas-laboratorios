const db = require('../db/connection');

const listar = () =>
  db.prepare('SELECT * FROM laboratorios ORDER BY nombre').all();

const obtenerPorId = (id) =>
  db.prepare('SELECT * FROM laboratorios WHERE id = ?').get(id);

const obtenerPorNombre = (nombre) =>
  db.prepare('SELECT * FROM laboratorios WHERE nombre = ?').get(nombre);

const crear = ({ nombre, ubicacion, capacidad, software = null, foto = null, estado = 'DISPONIBLE' }) => {
  const info = db
    .prepare(
      `INSERT INTO laboratorios (nombre, ubicacion, capacidad, software, foto, estado)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(nombre, ubicacion, capacidad, software, foto, estado);
  return obtenerPorId(info.lastInsertRowid);
};

const actualizar = (id, datos) => {
  const actual = obtenerPorId(id);
  if (!actual) return null;
  const nuevo = { ...actual, ...datos };
  db.prepare(
    `UPDATE laboratorios
     SET nombre = ?, ubicacion = ?, capacidad = ?, software = ?, foto = ?, estado = ?
     WHERE id = ?`
  ).run(nuevo.nombre, nuevo.ubicacion, nuevo.capacidad, nuevo.software, nuevo.foto, nuevo.estado, id);
  return obtenerPorId(id);
};

const eliminar = (id) =>
  db.prepare('DELETE FROM laboratorios WHERE id = ?').run(id).changes > 0;

const tieneReservas = (id) =>
  db.prepare('SELECT COUNT(*) AS total FROM reservas WHERE laboratorio_id = ?').get(id).total > 0;

module.exports = { listar, obtenerPorId, obtenerPorNombre, crear, actualizar, eliminar, tieneReservas };
