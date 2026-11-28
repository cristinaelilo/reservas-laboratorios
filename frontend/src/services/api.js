import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Agrega el token JWT a cada petición si el usuario ya inició sesión.
// El AuthContext guarda el token en sessionStorage.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
