import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Agrega el token JWT a cada petición si el usuario ya inició sesión
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
