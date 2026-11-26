import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PanelBase({ titulo, opciones, children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const roles = {
    ADMIN: 'Administrador',
    DOCENTE: 'Docente',
    ESTUDIANTE: 'Estudiante'
  };

  const rol = roles[usuario.rol];

  const iniciales = usuario.nombre
    .split(' ')
    .slice(0, 2)
    .map(nombre => nombre.charAt(0).toUpperCase())
    .join('');

  const [fecha] = useState(() =>
    new Date().toLocaleDateString('es-EC', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  );

  function cerrarSesion() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="lab-panel">

      {/* Menu lateral */}

      <aside className="lab-sidebar">

        <div className="lab-sidebar-marca">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 16h10" />
          </svg>

          LABU
        </div>

        <div className="lab-sidebar-rol">
          <div>
            <small>ESPACIO DE</small>
            <strong>{rol}</strong>
          </div>
        </div>

        <nav className="lab-sidebar-nav">

          <div className="lab-menu-item lab-menu-activo">
            Panel general
          </div>

          {opciones.map(opcion => (
            <div className="lab-menu-item" key={opcion}>
              {opcion}
            </div>
          ))}

        </nav>

        <button
          className="lab-cerrar-sesion"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>

      </aside>

      {/* Contenido del panel */}

      <div className="lab-panel-contenido">

        <header className="lab-panel-header">

          <div>
            <h2>Gestión de Laboratorios</h2>
            <p>Facultad de Ingeniería</p>
          </div>

          <div className="lab-perfil">

            <div className="lab-avatar">
              {iniciales}
            </div>

            <div className="lab-perfil-datos">
              <strong>{usuario.nombre}</strong>
              <small>{rol}</small>
            </div>

          </div>

        </header>

        <main className="lab-panel-main">

          <section className="lab-saludo">

            <p className="lab-fecha">{fecha}</p>

            <h1>
              Hola, {usuario.nombre.split(' ')[0]}
            </h1>

            <p className="lab-saludo-descripcion">
              {titulo}
            </p>

          </section>

          {children}

        </main>

      </div>

    </div>
  );
}