import { createContext, useContext, useEffect, useState } from 'react';
import { iniciarSesion, obtenerUsuario } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(
    sessionStorage.getItem('token')
  );
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function verificarSesion() {
      if (!token) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerUsuario(token);

        if (activo) {
          setUsuario(datos.usuario);
        }
      } catch {
        if (activo) {
          sessionStorage.removeItem('token');
          setToken(null);
          setUsuario(null);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    verificarSesion();

    return () => {
      activo = false;
    };
  }, [token]);

  async function login(correo, password) {
    const datos = await iniciarSesion(correo, password);

    sessionStorage.setItem('token', datos.token);

    setToken(datos.token);
    setUsuario(datos.usuario);

    return datos.usuario;
  }

  function logout() {
    sessionStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, token, cargando, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}