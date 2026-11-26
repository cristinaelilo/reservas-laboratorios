const db = require('../db/connection');

// Obtener todos los equipos
function listarEquipos() {
  return db.prepare(`
    SELECT e.*, l.nombre AS laboratorio
    FROM equipos e
    INNER JOIN laboratorios l
    ON e.laboratorio_id = l.id
    ORDER BY e.id
  `).all();
}

// Buscar un equipo por su ID
function obtenerEquipo(id) {
  return db.prepare(`
    SELECT e.*, l.nombre AS laboratorio
    FROM equipos e
    INNER JOIN laboratorios l
    ON e.laboratorio_id = l.id
    WHERE e.id = ?
  `).get(id);
}

// Buscar un equipo por su codigo
function buscarPorCodigo(codigo) {
  return db.prepare(`
    SELECT * FROM equipos WHERE codigo = ?
  `).get(codigo);
}

// Comprobar que el laboratorio existe
function existeLaboratorio(id) {
  return db.prepare(`
    SELECT id FROM laboratorios WHERE id = ?
  `).get(id);
}

// Registrar un equipo
function crearEquipo(datos) {
  const resultado = db.prepare(`
    INSERT INTO equipos
    (codigo, tipo, laboratorio_id, estado)
    VALUES (?, ?, ?, ?)
  `).run(
    datos.codigo,
    datos.tipo,
    datos.laboratorio_id,
    datos.estado
  );

  return obtenerEquipo(resultado.lastInsertRowid);
}

// Actualizar un equipo
function actualizarEquipo(id, datos) {
  db.prepare(`
    UPDATE equipos
    SET codigo = ?,
        tipo = ?,
        laboratorio_id = ?,
        estado = ?
    WHERE id = ?
  `).run(
    datos.codigo,
    datos.tipo,
    datos.laboratorio_id,
    datos.estado,
    id
  );

  return obtenerEquipo(id);
}

// Comprobar si tiene reservas o incidencias
function tieneReferencias(id) {
  const reserva = db.prepare(`
    SELECT id FROM reservas
    WHERE equipo_id = ?
    LIMIT 1
  `).get(id);

  const incidencia = db.prepare(`
    SELECT id FROM incidencias
    WHERE equipo_id = ?
    LIMIT 1
  `).get(id);

  return Boolean(reserva || incidencia);
}

// Eliminar un equipo
function eliminarEquipo(id) {
  return db.prepare(`
    DELETE FROM equipos WHERE id = ?
  `).run(id);
}

module.exports = {
  listarEquipos,
  obtenerEquipo,
  buscarPorCodigo,
  existeLaboratorio,
  crearEquipo,
  actualizarEquipo,
  tieneReferencias,
  eliminarEquipo
};