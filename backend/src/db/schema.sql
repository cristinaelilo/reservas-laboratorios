-- =====================================================================
-- Esquema de la base de datos: Reservas de Laboratorios (SQLite)
-- Fechas: 'YYYY-MM-DD'   Horas: 'HH:MM'   (el texto se compara bien)
-- =====================================================================
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS incidencias;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS bloqueos;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS equipos;
DROP TABLE IF EXISTS laboratorios;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre        TEXT NOT NULL,
  correo        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol           TEXT NOT NULL CHECK (rol IN ('ADMIN','DOCENTE','ESTUDIANTE')),
  activo        INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1))
);

CREATE TABLE laboratorios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL UNIQUE,
  ubicacion  TEXT NOT NULL,
  capacidad  INTEGER NOT NULL CHECK (capacidad > 0),
  software   TEXT,
  foto       TEXT,
  estado     TEXT NOT NULL DEFAULT 'DISPONIBLE'
             CHECK (estado IN ('DISPONIBLE','MANTENIMIENTO'))
);

CREATE TABLE equipos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo         TEXT NOT NULL UNIQUE,
  tipo           TEXT NOT NULL,
  laboratorio_id INTEGER NOT NULL REFERENCES laboratorios(id) ON DELETE CASCADE,
  estado         TEXT NOT NULL DEFAULT 'OPERATIVO'
                 CHECK (estado IN ('OPERATIVO','DANADO','EN_REPARACION'))
);

CREATE TABLE horarios (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  laboratorio_id INTEGER NOT NULL REFERENCES laboratorios(id) ON DELETE CASCADE,
  dia_semana     INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=lunes ... 7=domingo
  hora_inicio    TEXT NOT NULL,
  hora_fin       TEXT NOT NULL,
  CHECK (hora_fin > hora_inicio),
  UNIQUE (laboratorio_id, dia_semana, hora_inicio)
);

CREATE TABLE bloqueos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  laboratorio_id INTEGER REFERENCES laboratorios(id) ON DELETE CASCADE, -- NULL = todos los laboratorios
  fecha          TEXT NOT NULL,
  hora_inicio    TEXT NOT NULL,
  hora_fin       TEXT NOT NULL,
  tipo           TEXT NOT NULL CHECK (tipo IN ('CLASE_FIJA','MANTENIMIENTO','FERIADO')),
  motivo         TEXT,
  CHECK (hora_fin > hora_inicio)
);

CREATE TABLE reservas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
  laboratorio_id INTEGER NOT NULL REFERENCES laboratorios(id),
  horario_id     INTEGER NOT NULL REFERENCES horarios(id),
  equipo_id      INTEGER REFERENCES equipos(id),      -- NULL si es laboratorio completo
  fecha          TEXT NOT NULL,
  tipo           TEXT NOT NULL CHECK (tipo IN ('LABORATORIO','PUESTO')),
  asignatura     TEXT,
  motivo         TEXT,
  estado         TEXT NOT NULL DEFAULT 'PENDIENTE'
                 CHECK (estado IN ('PENDIENTE','APROBADA','RECHAZADA','CANCELADA','FINALIZADA')),
  mensaje_admin  TEXT,
  creada_en      TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  -- Un PUESTO exige equipo; un LABORATORIO completo no lleva equipo
  CHECK ((tipo = 'PUESTO' AND equipo_id IS NOT NULL)
      OR (tipo = 'LABORATORIO' AND equipo_id IS NULL))
);

-- Un equipo no se reserva dos veces en la misma franja y fecha
CREATE UNIQUE INDEX uq_reserva_equipo_franja
  ON reservas (equipo_id, fecha, horario_id)
  WHERE tipo = 'PUESTO' AND estado IN ('PENDIENTE','APROBADA');

-- Un laboratorio no tiene dos reservas completas aprobadas en la misma franja y fecha
CREATE UNIQUE INDEX uq_reserva_lab_completo
  ON reservas (laboratorio_id, fecha, horario_id)
  WHERE tipo = 'LABORATORIO' AND estado = 'APROBADA';

CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_lab_fecha ON reservas (laboratorio_id, fecha);

CREATE TABLE incidencias (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  equipo_id        INTEGER NOT NULL REFERENCES equipos(id),
  usuario_id       INTEGER NOT NULL REFERENCES usuarios(id),
  descripcion      TEXT NOT NULL,
  prioridad        TEXT NOT NULL DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA','MEDIA','ALTA')),
  estado           TEXT NOT NULL DEFAULT 'ABIERTA'
                   CHECK (estado IN ('ABIERTA','EN_REVISION','RESUELTA')),
  comentario_admin TEXT,
  creada_en        TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE notificaciones (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mensaje       TEXT NOT NULL,
  leida         INTEGER NOT NULL DEFAULT 0 CHECK (leida IN (0,1)),
  reserva_id    INTEGER REFERENCES reservas(id) ON DELETE SET NULL,
  incidencia_id INTEGER REFERENCES incidencias(id) ON DELETE SET NULL,
  creada_en     TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX idx_notif_usuario ON notificaciones (usuario_id, leida);
