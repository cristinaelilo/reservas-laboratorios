// Carga datos de prueba. Ejecutar después de db:init
const bcrypt = require('bcryptjs');
const db = require('./connection');

const hash = (clave) => bcrypt.hashSync(clave, 10);

const sembrar = db.transaction(() => {
  // ---- Usuarios de prueba (uno por rol + extras) ----
  const insUsuario = db.prepare(
    'INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)'
  );
  insUsuario.run('Administrador', 'admin@lab.edu.ec', hash('admin123'), 'ADMIN');
  insUsuario.run('Docente Demo', 'docente@lab.edu.ec', hash('docente123'), 'DOCENTE');
  insUsuario.run('Estudiante Demo', 'estudiante@lab.edu.ec', hash('estudiante123'), 'ESTUDIANTE');
  insUsuario.run('Docente Dos', 'docente2@lab.edu.ec', hash('docente123'), 'DOCENTE');
  insUsuario.run('Estudiante Dos', 'estudiante2@lab.edu.ec', hash('estudiante123'), 'ESTUDIANTE');

  // ---- Laboratorios ----
  const insLab = db.prepare(
    'INSERT INTO laboratorios (nombre, ubicacion, capacidad, software, foto, estado) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const lab1 = insLab.run('Laboratorio de Computación 1', 'Edificio A, piso 1', 5,
    'Visual Studio Code, Node.js, Git', null, 'DISPONIBLE').lastInsertRowid;
  const lab2 = insLab.run('Laboratorio de Redes', 'Edificio B, piso 2', 4,
    'Packet Tracer, Wireshark', null, 'DISPONIBLE').lastInsertRowid;
  insLab.run('Laboratorio de Electrónica', 'Edificio C, piso 1', 6,
    'Proteus, Arduino IDE', null, 'MANTENIMIENTO');

  // ---- Equipos ----
  const insEq = db.prepare(
    'INSERT INTO equipos (codigo, tipo, laboratorio_id, estado) VALUES (?, ?, ?, ?)'
  );
  for (let i = 1; i <= 5; i++) {
    insEq.run(`PC-L1-0${i}`, 'Computador', lab1, i === 5 ? 'DANADO' : 'OPERATIVO');
  }
  for (let i = 1; i <= 4; i++) {
    insEq.run(`PC-L2-0${i}`, 'Computador', lab2, 'OPERATIVO');
  }

  // ---- Horarios: lunes a viernes, 4 franjas por día ----
  const insHor = db.prepare(
    'INSERT INTO horarios (laboratorio_id, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)'
  );
  const franjas = [['07:00', '09:00'], ['09:00', '11:00'], ['11:00', '13:00'], ['14:00', '16:00']];
  for (const lab of [lab1, lab2]) {
    for (let dia = 1; dia <= 5; dia++) {
      for (const [ini, fin] of franjas) insHor.run(lab, dia, ini, fin);
    }
  }

  // ---- Un bloqueo de ejemplo: feriado en todos los laboratorios ----
  db.prepare(
    'INSERT INTO bloqueos (laboratorio_id, fecha, hora_inicio, hora_fin, tipo, motivo) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(null, '2026-12-25', '00:00', '23:59', 'FERIADO', 'Navidad');
});

sembrar();
console.log('Datos semilla cargados.');
console.log('Usuarios de prueba:');
console.log('  admin@lab.edu.ec       / admin123      (ADMIN)');
console.log('  docente@lab.edu.ec     / docente123    (DOCENTE)');
console.log('  estudiante@lab.edu.ec  / estudiante123 (ESTUDIANTE)');
