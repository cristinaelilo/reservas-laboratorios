import { useEffect, useMemo, useState } from 'react';
import PanelBase from '../../components/PanelBase';
import FormularioLaboratorio from '../../components/FormularioLaboratorio';
import ModalConfirmar from '../../components/ModalConfirmar';
import { opcionesAdmin } from '../../layouts/menuAdmin';
import {
  listarLaboratorios,
  crearLaboratorio,
  actualizarLaboratorio,
  eliminarLaboratorio,
  mensajeDeError,
} from '../../services/laboratoriosService';
import './Laboratorios.css';

// Textos de cada estado (la base guarda DISPONIBLE o MANTENIMIENTO)
const ETIQUETA_ESTADO = { DISPONIBLE: 'Disponible', MANTENIMIENTO: 'No disponible' };

// Búsqueda sin distinguir mayúsculas ni tildes
const normalizar = (texto) =>
  (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// "Edificio A, piso 1" -> "Edificio A · Piso 1"
const formatearUbicacion = (texto) =>
  (texto || '')
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' · ');

function IconoLaboratorio({ foto, nombre }) {
  const [falla, setFalla] = useState(false);

  if (foto && !falla) {
    return <img className="labs-foto" src={foto} alt={`Foto de ${nombre}`} onError={() => setFalla(true)} />;
  }
  return (
    <div className="labs-icono" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 16h10" />
      </svg>
    </div>
  );
}

export default function Laboratorios() {
  const [laboratorios, setLaboratorios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [intento, setIntento] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState(null); // { laboratorio: lab | null }
  const [aEliminar, setAEliminar] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'exito' | 'error', texto }

  useEffect(() => {
    let activo = true;

    listarLaboratorios()
      .then((datos) => activo && setLaboratorios(datos))
      .catch((e) => activo && setErrorCarga(mensajeDeError(e)))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [intento]);

  useEffect(() => {
    if (!aviso) return undefined;
    const temporizador = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const visibles = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    if (!termino) return laboratorios;
    return laboratorios.filter(
      (lab) => normalizar(lab.nombre).includes(termino) || normalizar(lab.software).includes(termino)
    );
  }, [laboratorios, busqueda]);

  function reintentar() {
    setErrorCarga('');
    setCargando(true);
    setIntento((n) => n + 1);
  }

  // Crear o editar (lanza el error para que el formulario lo muestre)
  async function guardar(datos) {
    const editando = formulario.laboratorio;
    if (editando) {
      const actualizado = await actualizarLaboratorio(editando.id, datos);
      setLaboratorios((lista) => lista.map((l) => (l.id === actualizado.id ? actualizado : l)));
      setAviso({ tipo: 'exito', texto: 'Laboratorio actualizado correctamente' });
    } else {
      const creado = await crearLaboratorio(datos);
      setLaboratorios((lista) => [...lista, creado].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setAviso({ tipo: 'exito', texto: 'Laboratorio creado correctamente' });
    }
    setFormulario(null);
  }

  async function cambiarEstado(lab) {
    const nuevo = lab.estado === 'DISPONIBLE' ? 'MANTENIMIENTO' : 'DISPONIBLE';
    try {
      const actualizado = await actualizarLaboratorio(lab.id, { estado: nuevo });
      setLaboratorios((lista) => lista.map((l) => (l.id === actualizado.id ? actualizado : l)));
      setAviso({ tipo: 'exito', texto: `${lab.nombre}: ${ETIQUETA_ESTADO[nuevo].toLowerCase()}` });
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeDeError(e) });
    }
  }

  async function confirmarEliminar() {
    setEliminando(true);
    setErrorEliminar('');
    try {
      await eliminarLaboratorio(aEliminar.id);
      setLaboratorios((lista) => lista.filter((l) => l.id !== aEliminar.id));
      setAviso({ tipo: 'exito', texto: 'Laboratorio eliminado' });
      setAEliminar(null);
    } catch (e) {
      setErrorEliminar(mensajeDeError(e));
    } finally {
      setEliminando(false);
    }
  }

  function cancelarEliminar() {
    setAEliminar(null);
    setErrorEliminar('');
  }

  return (
    <PanelBase titulo="Gestión de laboratorios" opciones={opcionesAdmin} saludo={false}>
      <div className="labs-pagina">

        <header className="labs-encabezado">
          <div>
            <h1>Laboratorios</h1>
            <p>Explora los espacios, su equipamiento y disponibilidad.</p>
          </div>
          <button type="button" className="labs-boton labs-boton-primario labs-boton-con-icono" onClick={() => setFormulario({ laboratorio: null })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo laboratorio
          </button>
        </header>

        {aviso && (
          <p className={`labs-aviso labs-aviso-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
            {aviso.texto}
          </p>
        )}

        <div className="labs-buscador">
          <label htmlFor="labs-busqueda" className="labs-solo-lectores">Buscar por nombre o software</label>
          <svg className="labs-buscador-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="labs-busqueda"
            type="search"
            placeholder="Buscar por nombre o software..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {cargando && <p className="labs-mensaje">Cargando laboratorios...</p>}

        {!cargando && errorCarga && (
          <div className="labs-mensaje labs-mensaje-error" role="alert">
            <p>{errorCarga}</p>
            <button type="button" className="labs-boton labs-boton-claro" onClick={reintentar}>Reintentar</button>
          </div>
        )}

        {!cargando && !errorCarga && laboratorios.length === 0 && (
          <p className="labs-mensaje">Aún no hay laboratorios. Crea el primero con «Nuevo laboratorio».</p>
        )}

        {!cargando && !errorCarga && laboratorios.length > 0 && visibles.length === 0 && (
          <p className="labs-mensaje">No hay resultados para «{busqueda}».</p>
        )}

        <section className="labs-grilla" aria-label="Lista de laboratorios">
          {visibles.map((lab) => {
            const disponible = lab.estado === 'DISPONIBLE';
            return (
              <article className="labs-tarjeta" key={lab.id}>
                <div className="labs-tarjeta-cabecera">
                  <IconoLaboratorio foto={lab.foto} nombre={lab.nombre} />
                  <span className={`labs-insignia ${disponible ? 'labs-insignia-ok' : 'labs-insignia-off'}`}>
                    {ETIQUETA_ESTADO[lab.estado] || lab.estado}
                  </span>
                </div>

                <h3>{lab.nombre}</h3>
                <p className="labs-ubicacion">{formatearUbicacion(lab.ubicacion)}</p>

                <dl className="labs-datos">
                  <div>
                    <dt>Capacidad</dt>
                    <dd>{lab.capacidad} personas</dd>
                  </div>
                  <div>
                    <dt>Software</dt>
                    <dd>{lab.software || 'Sin software registrado'}</dd>
                  </div>
                </dl>

                <div className="labs-acciones">
                  <button type="button" className="labs-boton labs-boton-chico labs-boton-claro" onClick={() => cambiarEstado(lab)}>
                    {disponible ? 'Marcar no disponible' : 'Habilitar'}
                  </button>
                  <button type="button" className="labs-boton labs-boton-chico labs-boton-claro" onClick={() => setFormulario({ laboratorio: lab })}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="labs-boton labs-boton-chico labs-boton-icono"
                    aria-label={`Eliminar ${lab.nombre}`}
                    title="Eliminar"
                    onClick={() => setAEliminar(lab)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {formulario && (
        <FormularioLaboratorio
          laboratorio={formulario.laboratorio}
          onGuardar={guardar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      {aEliminar && (
        <ModalConfirmar
          titulo="¿Eliminar laboratorio?"
          mensaje={`Se eliminará «${aEliminar.nombre}» y sus equipos. Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          peligro
          enviando={eliminando}
          error={errorEliminar}
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
        />
      )}
    </PanelBase>
  );
}
