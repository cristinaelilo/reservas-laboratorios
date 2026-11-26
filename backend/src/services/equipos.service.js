const repo = require('../repositories/equipos.repo');

const estadosPermitidos = [
  'OPERATIVO',
  'DANADO',
  'EN_REPARACION'
];

// Generar errores
function generarError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  throw error;
}

// Validar el ID del equipo
function validarId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    generarError('El ID no es valido', 400);
  }
}

// Validar los datos ingresados
function validarDatos(datos, id = null) {
  if (
    typeof datos.codigo !== 'string' ||
    !datos.codigo.trim()
  ) {
    generarError('El codigo es obligatorio', 400);
  }

  if (
    typeof datos.tipo !== 'string' ||
    !datos.tipo.trim()
  ) {
    generarError('El tipo es obligatorio', 400);
  }

  if (
    !Number.isSafeInteger(datos.laboratorio_id) ||
    datos.laboratorio_id <= 0
  ) {
    generarError('El laboratorio no es valido', 400);
  }

  if (!estadosPermitidos.includes(datos.estado)) {
    generarError('El estado no es valido', 400);
  }

  if (!repo.existeLaboratorio(datos.laboratorio_id)) {
    generarError('El laboratorio no existe', 404);
  }

  const equipo = repo.buscarPorCodigo(
    datos.codigo.trim()
  );

  if (equipo && equipo.id !== id) {
    generarError('El codigo del equipo ya existe', 409);
  }

  return {
    codigo: datos.codigo.trim(),
    tipo: datos.tipo.trim(),
    laboratorio_id: datos.laboratorio_id,
    estado: datos.estado
  };
}

// Listar todos los equipos
function listarEquipos() {
  return repo.listarEquipos();
}

// Obtener un equipo por ID
function obtenerEquipo(id) {
  validarId(id);

  const equipo = repo.obtenerEquipo(id);

  if (!equipo) {
    generarError('Equipo no encontrado', 404);
  }

  return equipo;
}

// Registrar un equipo
function crearEquipo(datos) {
  const datosValidados = validarDatos({
    ...datos,
    estado: datos.estado ?? 'OPERATIVO'
  });

  return repo.crearEquipo(datosValidados);
}

// Actualizar un equipo
function actualizarEquipo(id, datos) {
  const equipoActual = obtenerEquipo(id);

  const datosValidados = validarDatos({
    ...equipoActual,
    ...datos
  }, id);

  // Proteger el historial del equipo
  if (
    equipoActual.laboratorio_id !==
      datosValidados.laboratorio_id &&
    repo.tieneReferencias(id)
  ) {
    generarError(
      'No se puede cambiar de laboratorio un equipo con reservas o incidencias',
      409
    );
  }

  return repo.actualizarEquipo(id, datosValidados);
}

// Eliminar un equipo
function eliminarEquipo(id) {
  obtenerEquipo(id);

  if (repo.tieneReferencias(id)) {
    generarError(
      'No se puede eliminar un equipo con reservas o incidencias',
      409
    );
  }

  repo.eliminarEquipo(id);

  return {
    mensaje: 'Equipo eliminado correctamente'
  };
}

module.exports = {
  listarEquipos,
  obtenerEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
};