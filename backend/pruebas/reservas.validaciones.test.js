// Pruebas del servicio de validaciones. Ejecutar desde backend:
//   node --test pruebas/reservas.validaciones.test.js
process.env.DB_PATH = './data/test.db';

const { test, before } = require('node:test');
const assert = require('node:assert');

require('../src/db/init');
require('../src/db/seed');

const db = require('../src/db/connection');
const { validarReserva } = require('../src/services/reservas.validaciones');

// Usuarios del seed: 2 docente, 3 estudiante, 5 estudiante2 | Lab 1: equipos 1-4 operativos, 5 dañado | Lab 3: mantenimiento
const DOCENTE = 2, EST1 = 3, EST2 = 5;

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// Próxima fecha futura (a más de 7 días) que cae en ese día de la semana (1=lunes ... 7=domingo)
const futuro = (dia) => {
  const d = new Date();
  d.setDate(d.getDate() + 8);
  while ((d.getDay() || 7) !== dia) d.setDate(d.getDate() + 1);
  return iso(d);
};
const franja = (lab, dia, n = 0) =>
  db.prepare('SELECT * FROM horarios WHERE laboratorio_id = ? AND dia_semana = ? ORDER BY hora_inicio').all(lab, dia)[n];
const limpiar = () => db.exec("DELETE FROM reservas; DELETE FROM bloqueos WHERE motivo = 'prueba'");
const guardar = (usuario, lab, h, fecha, tipo, equipo, estado = 'APROBADA') =>
  db.prepare('INSERT INTO reservas (usuario_id, laboratorio_id, horario_id, equipo_id, fecha, tipo, estado) VALUES (?,?,?,?,?,?,?)')
    .run(usuario, lab, h.id, equipo, fecha, tipo, estado);
const rechaza = (datos, status, texto, opciones) =>
  assert.throws(() => validarReserva(datos, opciones), (e) => e.status === status && e.message.includes(texto));

before(limpiar);

const lunes = futuro(1);
const h = franja(1, 1, 0); // laboratorio 1, lunes, primera franja
const base = { usuario_id: EST1, rol: 'ESTUDIANTE', laboratorio_id: 1, horario_id: h.id, fecha: lunes, tipo: 'PUESTO', equipo_id: 1 };

test('reserva de puesto válida', () => {
  limpiar();
  const r = validarReserva(base);
  assert.strictEqual(r.equipo.id, 1);
});

test('solicitud de laboratorio completo válida (docente)', () => {
  limpiar();
  validarReserva({ ...base, usuario_id: DOCENTE, rol: 'DOCENTE', tipo: 'LABORATORIO', equipo_id: null });
});

test('rechaza fecha inválida o con formato incorrecto', () => {
  rechaza({ ...base, fecha: '2026-02-31' }, 400, 'fecha no es válida');
  rechaza({ ...base, fecha: '01/12/2026' }, 400, 'fecha no es válida');
});

test('rechaza fechas pasadas', () => {
  rechaza({ ...base, fecha: '2020-01-06' }, 409, 'pasada'); // fue lunes
});

test('rechaza una franja que ya empezó hoy', () => {
  const ahora = new Date(`${lunes}T10:00:00`);
  rechaza(base, 409, 'pasada', { ahora }); // la franja empieza a las 07:00
});

test('rechaza si la franja no corresponde al día de la semana', () => {
  rechaza({ ...base, fecha: futuro(2) }, 400, 'día de la semana');
});

test('rechaza franja de otro laboratorio', () => {
  rechaza({ ...base, horario_id: franja(2, 1, 0).id }, 400, 'no pertenece');
});

test('rechaza laboratorio en mantenimiento', () => {
  rechaza({ ...base, laboratorio_id: 3 }, 409, 'no está disponible');
});

test('rechaza equipo dañado', () => {
  rechaza({ ...base, equipo_id: 5 }, 409, 'no está operativo');
});

test('rechaza equipo de otro laboratorio', () => {
  rechaza({ ...base, equipo_id: 6 }, 400, 'no pertenece');
});

test('rechaza franja bloqueada (de ese laboratorio y de todos)', () => {
  limpiar();
  db.prepare("INSERT INTO bloqueos (laboratorio_id, fecha, hora_inicio, hora_fin, tipo, motivo) VALUES (1, ?, '06:00', '08:00', 'CLASE_FIJA', 'prueba')").run(lunes);
  rechaza(base, 409, 'bloqueada');
  limpiar();
  db.prepare("INSERT INTO bloqueos (laboratorio_id, fecha, hora_inicio, hora_fin, tipo, motivo) VALUES (NULL, ?, '00:00', '23:59', 'FERIADO', 'prueba')").run(lunes);
  rechaza(base, 409, 'bloqueada');
  limpiar();
});

test('rechaza el mismo equipo en la misma franja', () => {
  limpiar();
  guardar(EST2, 1, h, lunes, 'PUESTO', 1, 'PENDIENTE');
  rechaza(base, 409, 'ya está reservado');
});

test('rechaza cuando se alcanza la capacidad', () => {
  limpiar();
  db.prepare('UPDATE laboratorios SET capacidad = 1 WHERE id = 1').run();
  guardar(EST2, 1, h, lunes, 'PUESTO', 2);
  rechaza(base, 409, 'capacidad');
  db.prepare('UPDATE laboratorios SET capacidad = 5 WHERE id = 1').run();
  limpiar();
});

test('rechaza puesto si hay laboratorio completo aprobado', () => {
  limpiar();
  guardar(DOCENTE, 1, h, lunes, 'LABORATORIO', null, 'APROBADA');
  rechaza(base, 409, 'reserva completa aprobada');
});

test('una solicitud de docente PENDIENTE no ocupa la franja', () => {
  limpiar();
  guardar(4, 1, h, lunes, 'LABORATORIO', null, 'PENDIENTE');
  validarReserva(base); // no lanza
});

test('rechaza segunda reserva completa aprobada en la misma franja', () => {
  limpiar();
  guardar(4, 1, h, lunes, 'LABORATORIO', null, 'APROBADA');
  rechaza({ ...base, usuario_id: DOCENTE, rol: 'DOCENTE', tipo: 'LABORATORIO', equipo_id: null }, 409, 'reserva completa aprobada');
});

test('rechaza solapamiento de un mismo usuario en dos laboratorios', () => {
  limpiar();
  guardar(EST1, 2, franja(2, 1, 0), lunes, 'PUESTO', 6);
  rechaza(base, 409, 'Ya tienes una reserva');
});

test('una reserva cancelada no cuenta', () => {
  limpiar();
  guardar(EST1, 1, h, lunes, 'PUESTO', 1, 'CANCELADA');
  validarReserva(base);
});

test('rechaza el rol equivocado', () => {
  rechaza({ ...base, rol: 'DOCENTE' }, 403, 'estudiante');
  rechaza({ ...base, rol: 'ESTUDIANTE', tipo: 'LABORATORIO', equipo_id: null }, 403, 'docente');
});

test('rechaza puesto sin equipo y laboratorio completo con equipo', () => {
  rechaza({ ...base, equipo_id: null }, 400, 'elegir un equipo');
  rechaza({ ...base, usuario_id: DOCENTE, rol: 'DOCENTE', tipo: 'LABORATORIO', equipo_id: 1 }, 400, 'no lleva equipo');
});

test('limpieza final', () => limpiar());