const assert = require('node:assert/strict');
const db = require('../src/db/connection');
const service = require('../src/services/equipos.service');

// Iniciar una transaccion temporal
db.exec('BEGIN');

try {
  const laboratorio = db.prepare(
    'SELECT id FROM laboratorios LIMIT 1'
  ).get();

  const usuario = db.prepare(
    'SELECT id FROM usuarios LIMIT 1'
  ).get();

  // Crear un equipo temporal
  const equipo = service.crearEquipo({
    codigo: 'PC-HISTORIAL-' + Date.now(),
    tipo: 'Computador',
    laboratorio_id: laboratorio.id,
    estado: 'OPERATIVO'
  });

  // Registrar una incidencia temporal
  db.prepare(`
    INSERT INTO incidencias
    (equipo_id, usuario_id, descripcion)
    VALUES (?, ?, ?)
  `).run(
    equipo.id,
    usuario.id,
    'Incidencia temporal para prueba D5'
  );

  console.log('PRUEBA DE PROTECCION DEL HISTORIAL');
  console.log('Equipo:', equipo.codigo);
  console.log('Incidencia registrada correctamente');

  // Intentar eliminar el equipo
  assert.throws(
    () => service.eliminarEquipo(equipo.id),
    (error) => {
      console.log('Codigo HTTP esperado:', error.status);
      console.log('Respuesta:', error.message);

      return error.status === 409;
    }
  );

  // Comprobar que el equipo sigue existiendo
  assert.ok(service.obtenerEquipo(equipo.id));

  console.log('El equipo no fue eliminado');
  console.log('RESULTADO: PRUEBA SUPERADA');

} finally {
  // Deshacer todos los cambios temporales
  db.exec('ROLLBACK');
  console.log('Datos temporales revertidos');
}