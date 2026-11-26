const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function iniciarSesion(correo, password) {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ correo, password })
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Error al iniciar sesión');
  }

  return datos;
}

export async function obtenerUsuario(token) {
  const respuesta = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    throw new Error('Sesión no válida');
  }

  return await respuesta.json();
}