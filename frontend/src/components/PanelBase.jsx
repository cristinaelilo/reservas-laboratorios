import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

// opciones: texto (aún sin pantalla) u objeto { texto, ruta } (navega a esa ruta)
// saludo: false oculta el bloque "Hola, ..." (útil en pantallas de gestión)
export default function PanelBase({ titulo, opciones, saludo = true, children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const roles = {
    ADMIN: 'Administrador',
    DOCENTE: 'Docente',
    ESTUDIANTE: 'Estudiante'
  };

  const rol = roles[usuario.rol];
  const inicio = `/${usuario.rol.toLowerCase()}`;

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

  // Opción de menú que navega (div con rol de enlace para conservar los estilos del panel)
  function ItemMenu({ ruta, activo, children: texto }) {
    return (
      <div
        className={`lab-menu-item${activo ? ' lab-menu-activo' : ''}`}
        role="link"
        tabIndex={0}
        onClick={() => navigate(ruta)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(ruta)}
      >
        {texto}
      </div>
    );
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

          <ItemMenu ruta={inicio} activo={pathname === inicio}>
            Panel general
          </ItemMenu>

          {opciones.map(opcion =>
            typeof opcion === 'string' ? (
              <div className="lab-menu-item" key={opcion}>
                {opcion}
              </div>
            ) : (
              <ItemMenu
                key={opcion.ruta}
                ruta={opcion.ruta}
                activo={pathname.startsWith(opcion.ruta)}
              >
                {opcion.texto}
              </ItemMenu>
            )
          )}

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

          {saludo && (
            <section className="lab-saludo">

              <p className="lab-fecha">{fecha}</p>

              <h1>
                Hola, {usuario.nombre.split(' ')[0]}
              </h1>

              <p className="lab-saludo-descripcion">
                {titulo}
              </p>

            </section>
          )}

          {children}

        </main>

      </div>

    </div>
  );
}
