// Reglas de negocio para crear una reserva. Lo usan la solicitud del Docente (C8)
// y la reserva del Estudiante (B8). Si algo no cumple, lanza un error con código HTTP.
const labRepo = require('../repositories/laboratorios.repo');
const disp = require('../repositories/disponibilidad.repo');

const error = (status, mensaje) => Object.assign(new Error(mensaje), { status });

const dosDigitos = (n) => String(n).padStart(2, '0');

const aFecha = (d) => `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
const aHora = (d) => `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;

// 'YYYY-MM-DD' real (rechaza por ejemplo 2026-02-31)
const fechaValida = (fecha) => {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T00:00:00`);
  return !Number.isNaN(d.getTime()) && aFecha(d) === fecha;
};

// 1 = lunes ... 7 = domingo (igual que horarios.dia_semana)
const diaSemana = (fecha) => {
  const n = new Date(`${fecha}T00:00:00`).getDay();
  return n === 0 ? 7 : n;
};

/**
 * datos: { usuario_id, rol (opcional), laboratorio_id, horario_id, fecha, tipo, equipo_id }
 * opciones: { ahora } para poder probar con otra fecha y hora
 * Devuelve { laboratorio, horario, equipo }.
 */
const validarReserva = (datos, { ahora = new Date() } = {}) => {
  const { usuario_id, rol, laboratorio_id, horario_id, fecha, tipo, equipo_id } = datos;

  // 1. Datos básicos
  if (!['LABORATORIO', 'PUESTO'].includes(tipo)) {
    throw error(400, 'El tipo de reserva debe ser LABORATORIO o PUESTO');
  }
  if (!usuario_id || !laboratorio_id || !horario_id) {
    throw error(400, 'Faltan datos: usuario, laboratorio y franja son obligatorios');
  }
  if (!fechaValida(fecha)) {
    throw error(400, 'La fecha no es válida. Usa el formato AAAA-MM-DD');
  }

  // 2. Quién puede pedir cada tipo (si se informa el rol)
  if (rol && tipo === 'LABORATORIO' && rol !== 'DOCENTE') {
    throw error(403, 'Solo un docente puede reservar un laboratorio completo');
  }
  if (rol && tipo === 'PUESTO' && rol !== 'ESTUDIANTE') {
    throw error(403, 'Solo un estudiante puede reservar un puesto');
  }

  // 3. Laboratorio disponible
  const laboratorio = labRepo.obtenerPorId(laboratorio_id);
  if (!laboratorio) throw error(404, 'Laboratorio no encontrado');
  if (laboratorio.estado !== 'DISPONIBLE') {
    throw error(409, 'El laboratorio no está disponible (en mantenimiento)');
  }

  // 4. La franja existe, es de ese laboratorio y corresponde al día de la semana
  const horario = disp.obtenerHorario(horario_id);
  if (!horario) throw error(404, 'Franja horaria no encontrada');
  if (horario.laboratorio_id !== laboratorio.id) {
    throw error(400, 'La franja no pertenece a ese laboratorio');
  }
  if (horario.dia_semana !== diaSemana(fecha)) {
    throw error(400, 'La franja no corresponde al día de la semana de esa fecha');
  }

  // 5. No reservar en el pasado (ni en una franja que ya empezó hoy)
  const hoy = aFecha(ahora);
  if (fecha < hoy || (fecha === hoy && horario.hora_inicio <= aHora(ahora))) {
    throw error(409, 'No se puede reservar en una fecha u hora pasada');
  }

  // 6. Sin bloqueos que se crucen
  const bloqueos = disp.bloqueosQueSeCruzan(laboratorio.id, fecha, horario.hora_inicio, horario.hora_fin);
  if (bloqueos.length) {
    const b = bloqueos[0];
    throw error(409, `La franja está bloqueada (${b.tipo}${b.motivo ? ': ' + b.motivo : ''})`);
  }

  // 7. El usuario no puede tener otra reserva activa que se cruce en el tiempo
  if (disp.reservasDelUsuarioQueSeCruzan(usuario_id, fecha, horario.hora_inicio, horario.hora_fin).length) {
    throw error(409, 'Ya tienes una reserva en ese mismo horario');
  }

  // 8. Reglas según el tipo
  if (disp.reservaCompletaAprobada(laboratorio.id, fecha, horario.id)) {
    throw error(409, 'El laboratorio ya tiene una reserva completa aprobada en esa franja');
  }

  let equipo = null;
  if (tipo === 'PUESTO') {
    if (!equipo_id) throw error(400, 'Debes elegir un equipo');
    equipo = disp.obtenerEquipo(equipo_id);
    if (!equipo) throw error(404, 'Equipo no encontrado');
    if (equipo.laboratorio_id !== laboratorio.id) {
      throw error(400, 'El equipo no pertenece a ese laboratorio');
    }
    if (equipo.estado !== 'OPERATIVO') {
      throw error(409, 'El equipo no está operativo y no se puede reservar');
    }
    if (disp.equipoReservado(equipo.id, fecha, horario.id)) {
      throw error(409, 'Ese equipo ya está reservado en esa franja');
    }
    if (disp.contarPuestosActivos(laboratorio.id, fecha, horario.id) >= laboratorio.capacidad) {
      throw error(409, 'El laboratorio alcanzó su capacidad en esa franja');
    }
  } else if (equipo_id) {
    throw error(400, 'Una reserva de laboratorio completo no lleva equipo');
  }

  return { laboratorio, horario, equipo };
};

module.exports = { validarReserva, fechaValida, diaSemana };