import { useEffect, useState } from 'react';
import { mensajeDeError } from '../services/laboratoriosService';

const vacio = { nombre: '', ubicacion: '', capacidad: '', software: '', foto: '', estado: 'DISPONIBLE' };

// Convierte el laboratorio de la API en valores de texto para los campos
const aValores = (lab) =>
  lab
    ? {
        nombre: lab.nombre ?? '',
        ubicacion: lab.ubicacion ?? '',
        capacidad: String(lab.capacidad ?? ''),
        software: lab.software ?? '',
        foto: lab.foto ?? '',
        estado: lab.estado ?? 'DISPONIBLE',
      }
    : vacio;

// Mismas reglas que el servicio del backend, para avisar antes de enviar
function validar(v) {
  const errores = {};
  if (!v.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!v.ubicacion.trim()) errores.ubicacion = 'La ubicación es obligatoria';
  const capacidad = Number(v.capacidad);
  if (v.capacidad.trim() === '' || !Number.isInteger(capacidad) || capacidad <= 0) {
    errores.capacidad = 'La capacidad debe ser un número entero mayor que 0';
  }
  if (v.foto.trim() && !/^https?:\/\/.+/i.test(v.foto.trim())) {
    errores.foto = 'Usa un enlace que empiece con http:// o https://';
  }
  return errores;
}

// laboratorio = null → crear; con laboratorio → editar
export default function FormularioLaboratorio({ laboratorio, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => aValores(laboratorio));
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const editando = Boolean(laboratorio);

  useEffect(() => {
    const alPresionar = (e) => e.key === 'Escape' && !enviando && onCancelar();
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [enviando, onCancelar]);

  const cambiar = (campo) => (e) => {
    setValores((anterior) => ({ ...anterior, [campo]: e.target.value }));
    setErrores((anterior) => ({ ...anterior, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    setErrorServidor('');

    const encontrados = validar(valores);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      await onGuardar({
        nombre: valores.nombre.trim(),
        ubicacion: valores.ubicacion.trim(),
        capacidad: Number(valores.capacidad),
        software: valores.software.trim() || null,
        foto: valores.foto.trim() || null,
        estado: valores.estado,
      });
    } catch (error) {
      setErrorServidor(mensajeDeError(error));
      setEnviando(false);
    }
  }

  const campo = (id, etiqueta, props = {}) => (
    <div className="labs-campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        value={valores[id]}
        onChange={cambiar(id)}
        aria-invalid={Boolean(errores[id])}
        aria-describedby={errores[id] ? `${id}-error` : undefined}
        disabled={enviando}
        {...props}
      />
      {errores[id] && <p className="labs-error-campo" id={`${id}-error`}>{errores[id]}</p>}
    </div>
  );

  return (
    <div className="labs-fondo" onMouseDown={(e) => e.target === e.currentTarget && !enviando && onCancelar()}>
      <div className="labs-modal" role="dialog" aria-modal="true" aria-labelledby="labs-form-titulo">
        <h2 id="labs-form-titulo">{editando ? 'Editar laboratorio' : 'Nuevo laboratorio'}</h2>

        <form onSubmit={enviar} noValidate>
          {campo('nombre', 'Nombre', { autoFocus: true, placeholder: 'Laboratorio de Computación 1' })}
          {campo('ubicacion', 'Ubicación', { placeholder: 'Edificio A, piso 1' })}
          {campo('capacidad', 'Capacidad (personas)', { type: 'number', min: 1, step: 1, inputMode: 'numeric' })}
          {campo('software', 'Software instalado', { placeholder: 'Visual Studio Code, Node.js, Git' })}
          {campo('foto', 'Foto (enlace de la imagen, opcional)', { placeholder: 'https://...' })}

          <div className="labs-campo">
            <label htmlFor="estado">Estado</label>
            <select id="estado" value={valores.estado} onChange={cambiar('estado')} disabled={enviando}>
              <option value="DISPONIBLE">Disponible</option>
              <option value="MANTENIMIENTO">No disponible (en mantenimiento)</option>
            </select>
          </div>

          {errorServidor && <p className="labs-error-servidor" role="alert">{errorServidor}</p>}

          <div className="labs-modal-acciones">
            <button type="button" className="labs-boton labs-boton-claro" onClick={onCancelar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="labs-boton labs-boton-primario" disabled={enviando}>
              {enviando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear laboratorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
