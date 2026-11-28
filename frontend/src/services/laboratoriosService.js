import api from './api'

// Mensaje legible a partir de un error de axios (la API responde { mensaje })
export function mensajeDeError(error) {
  return error.response?.data?.mensaje || 'No se pudo conectar con el servidor'
}

export async function listarLaboratorios() {
  const { data } = await api.get('/laboratorios')
  return data
}

export async function crearLaboratorio(datos) {
  const { data } = await api.post('/laboratorios', datos)
  return data
}

export async function actualizarLaboratorio(id, datos) {
  const { data } = await api.put(`/laboratorios/${id}`, datos)
  return data
}

export async function eliminarLaboratorio(id) {
  await api.delete(`/laboratorios/${id}`)
}
