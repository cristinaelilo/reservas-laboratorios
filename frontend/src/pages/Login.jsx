import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Icono({ tipo }) {
  const iconos = {
    laboratorio: (
      <>
        <path d="M9 3h6M10 3v7l-6 10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3" />
        <path d="M7 16h10" />
      </>
    ),
    calendario: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M7 14h1M12 14h1M17 14h1M7 18h1M12 18h1" />
      </>
    ),
    admin: (
      <>
        <path d="M12 3l8 4v5c0 5-8 9-8 9s-8-4-8-9V7z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    docente: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M12 17v4M8 21h8M7 9h10M7 12h6" />
      </>
    ),
    estudiante: (
      <>
        <path d="m2 9 10-5 10 5-10 5z" />
        <path d="M6 11v6c4 3 8 3 12 0v-6M22 9v7" />
      </>
    ),
    flecha: (
      <path d="m9 6 6 6-6 6" />
    )
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconos[tipo]}
    </svg>
  );
}

export default function Login() {
  const { usuario, cargando, login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarLogin(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const usuario = await login(correo, password);

      navigate(`/${usuario.rol.toLowerCase()}`, {
        replace: true
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setEnviando(false);
    }
  }

  function rellenarAcceso(rol) {
    setError('');

    if (rol === 'ADMIN') {
      setCorreo('admin@lab.edu.ec');
      setPassword('admin123');
    }

    if (rol === 'DOCENTE') {
      setCorreo('docente@lab.edu.ec');
      setPassword('docente123');
    }

    if (rol === 'ESTUDIANTE') {
      setCorreo('estudiante@lab.edu.ec');
      setPassword('estudiante123');
    }
  }

  if (cargando) {
    return (
      <p className="mensaje-carga">
        Cargando...
      </p>
    );
  }

  if (usuario) {
    return (
      <Navigate
        to={`/${usuario.rol.toLowerCase()}`}
        replace
      />
    );
  }

  return (
    <main className="lab-login">

      {/* Sección izquierda */}

      <section className="lab-presentacion">

        <div className="lab-marca">
          <Icono tipo="laboratorio" />
          <span>LAB <b>U</b></span>
        </div>

        <div className="lab-presentacion-contenido">

          <p className="lab-universidad">
            UNIVERSIDAD · CARRERA DE COMPUTACIÓN
          </p>

          <h1>
            Espacios para aprender,{' '}
            <span>sin complicaciones.</span>
          </h1>

          <p className="lab-descripcion">
            Reserva laboratorios, consulta su disponibilidad
            y gestiona tus prácticas desde un solo lugar.
          </p>

          <div className="lab-beneficio">

            <div className="lab-beneficio-icono">
              <Icono tipo="calendario" />
            </div>

            <div>
              <h3>Gestión centralizada</h3>

              <p>
                Reservas, aprobaciones y espacios al día.
              </p>
            </div>

          </div>

        </div>

        <footer className="lab-footer">
          © 2026 Universidad del Ecuador
        </footer>

      </section>

      {/* Sección derecha */}

      <section className="lab-acceso">

        <div className="lab-formulario">

          <p className="lab-bienvenida">
            BIENVENIDO DE VUELTA
          </p>

          <h2>Inicia sesión</h2>

          <p className="lab-subtitulo">
            Ingresa con tus credenciales institucionales.
          </p>

          <form onSubmit={manejarLogin}>

            <label htmlFor="correo">
              Correo electrónico
            </label>

            <input
              id="correo"
              type="email"
              placeholder="nombre@lab.edu.ec"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="lab-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="lab-ingresar"
              disabled={enviando}
            >
              {enviando ? 'Ingresando...' : 'Ingresar'}

              {!enviando && <Icono tipo="flecha" />}
            </button>

          </form>

          {/* Accesos de demostración */}

          <div className="lab-separador">
            <span>ACCESOS DE DEMOSTRACIÓN</span>
          </div>

          <div className="lab-accesos-demo">

            <button
              type="button"
              className="lab-demo lab-demo-admin"
              onClick={() => rellenarAcceso('ADMIN')}
              disabled={enviando}
            >
              <Icono tipo="admin" />

              <div>
                <strong>Administrador</strong>
                <small>Rellenar acceso</small>
              </div>
            </button>

            <button
              type="button"
              className="lab-demo lab-demo-docente"
              onClick={() => rellenarAcceso('DOCENTE')}
              disabled={enviando}
            >
              <Icono tipo="docente" />

              <div>
                <strong>Docente</strong>
                <small>Rellenar acceso</small>
              </div>
            </button>

            <button
              type="button"
              className="lab-demo lab-demo-estudiante"
              onClick={() => rellenarAcceso('ESTUDIANTE')}
              disabled={enviando}
            >
              <Icono tipo="estudiante" />

              <div>
                <strong>Estudiante</strong>
                <small>Rellenar acceso</small>
              </div>
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}