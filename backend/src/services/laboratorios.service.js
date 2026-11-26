const repo = require('../repositories/laboratorios.repo');

const ESTADOS = ['DISPONIBLE', 'MANTENIMIENTO'];

// Error con código HTTP para que la ruta responda bien
const error = (status, mensaje) => Object.assign(new Error(mensaje), { status });

const limpiarTexto = (v) => (typeof v === 'string' ? v.trim() : v);

// Valida los datos de un laboratorio. Si es una edición, solo valida lo que llega.
const validar = (datos, { parcial = false } = {}) => {
  const errores = [];
  const requerido = (campo) => !parcial || datos[campo] !== undefined;

  if (requerido('nombre') && !limpiarTexto(datos.nombre)) errores.push('El nombre es obligatorio');
  if (requerido('ubicacion') && !limpiarTexto(datos.ubicacion)) errores.push('La ubicación es obligatoria');
  if (requerido('capacidad') && !(Number.isInteger(datos.capacidad) && datos.capacidad > 0)) {
    errores.push('La capacidad debe ser un número entero mayor que 0');
  }
  if (datos.estado !== undefined && !ESTADOS.includes(datos.estado)) {
    errores.push(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  if (errores.length) throw error(400, errores.join('. '));
};

const normalizar = (datos) => {
  const salida = { ...datos };
  for (const campo of ['nombre', 'ubicacion', 'software', 'foto']) {
    if (salida[campo] !== undefined) salida[campo] = limpiarTexto(salida[campo]) || null;
  }
  return salida;
};

const listar = () => repo.listar();

const obtener = (id) => {
  const lab = repo.obtenerPorId(id);
  if (!lab) throw error(404, 'Laboratorio no encontrado');
  return lab;
};

const crear = (datos) => {
  validar(datos);
  const limpio = normalizar(datos);
  if (repo.obtenerPorNombre(limpio.nombre)) throw error(409, 'Ya existe un laboratorio con ese nombre');
  return repo.crear(limpio);
};

const actualizar = (id, datos) => {
  obtener(id);
  validar(datos, { parcial: true });
  const limpio = normalizar(datos);
  if (limpio.nombre) {
    const otro = repo.obtenerPorNombre(limpio.nombre);
    if (otro && otro.id !== Number(id)) throw error(409, 'Ya existe un laboratorio con ese nombre');
  }
  return repo.actualizar(id, limpio);
};

const eliminar = (id) => {
  obtener(id);
  if (repo.tieneReservas(id)) {
    throw error(409, 'No se puede eliminar: el laboratorio tiene reservas. Cámbialo a MANTENIMIENTO.');
  }
  repo.eliminar(id);
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
