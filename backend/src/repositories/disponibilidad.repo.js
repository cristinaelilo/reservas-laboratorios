// Consultas de solo lectura que usa el servicio de validaciones de reservas.
const db = require('../db/connection');

const obtenerHorario = (id) =>
  db.prepare('SELECT * FROM horarios WHERE id = ?').get(id);

const obtenerEquipo = (id) =>
  db.prepare('SELECT * FROM equipos WHERE id = ?').get(id);

// Bloqueos de ese laboratorio (o de todos, laboratorio_id NULL) que se cruzan con el rango
const bloqueosQueSeCruzan = (laboratorioId, fecha, horaInicio, horaFin) =>
  db
    .prepare(
      `SELECT * FROM bloqueos
       WHERE (laboratorio_id = ? OR laboratorio_id IS NULL)
         AND fecha = ?
         AND hora_inicio < ? AND hora_fin > ?`
    )
    .all(laboratorioId, fecha, horaFin, horaInicio);

const reservaCompletaAprobada = (laboratorioId, fecha, horarioId) =>
  db
    .prepare(
      `SELECT * FROM reservas
       WHERE laboratorio_id = ? AND fecha = ? AND horario_id = ?
         AND tipo = 'LABORATORIO' AND estado = 'APROBADA'`
    )
    .get(laboratorioId, fecha, horarioId);

const contarPuestosActivos = (laboratorioId, fecha, horarioId) =>
  db
    .prepare(
      `SELECT COUNT(*) AS total FROM reservas
       WHERE laboratorio_id = ? AND fecha = ? AND horario_id = ?
         AND tipo = 'PUESTO' AND estado IN ('PENDIENTE','APROBADA')`
    )
    .get(laboratorioId, fecha, horarioId).total;

const equipoReservado = (equipoId, fecha, horarioId) =>
  db
    .prepare(
      `SELECT * FROM reservas
       WHERE equipo_id = ? AND fecha = ? AND horario_id = ?
         AND tipo = 'PUESTO' AND estado IN ('PENDIENTE','APROBADA')`
    )
    .get(equipoId, fecha, horarioId);

// Reservas activas del mismo usuario cuyo horario se cruza con el rango (en cualquier laboratorio)
const reservasDelUsuarioQueSeCruzan = (usuarioId, fecha, horaInicio, horaFin) =>
  db
    .prepare(
      `SELECT r.* FROM reservas r
       JOIN horarios h ON h.id = r.horario_id
       WHERE r.usuario_id = ? AND r.fecha = ?
         AND r.estado IN ('PENDIENTE','APROBADA')
         AND h.hora_inicio < ? AND h.hora_fin > ?`
    )
    .all(usuarioId, fecha, horaFin, horaInicio);

module.exports = {
  obtenerHorario,
  obtenerEquipo,
  bloqueosQueSeCruzan,
  reservaCompletaAprobada,
  contarPuestosActivos,
  equipoReservado,
  reservasDelUsuarioQueSeCruzan,
};