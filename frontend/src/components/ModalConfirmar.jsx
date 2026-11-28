import { useEffect } from 'react';

// Ventana de confirmación (por ejemplo, antes de eliminar)
export default function ModalConfirmar({
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligro = false,
  enviando = false,
  error = '',
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    const alPresionar = (e) => e.key === 'Escape' && !enviando && onCancelar();
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [enviando, onCancelar]);

  return (
    <div className="labs-fondo" onMouseDown={(e) => e.target === e.currentTarget && !enviando && onCancelar()}>
      <div className="labs-modal labs-modal-chico" role="alertdialog" aria-modal="true" aria-labelledby="labs-confirmar-titulo">
        <h2 id="labs-confirmar-titulo">{titulo}</h2>
        <p className="labs-modal-texto">{mensaje}</p>

        {error && <p className="labs-error-servidor" role="alert">{error}</p>}

        <div className="labs-modal-acciones">
          <button type="button" className="labs-boton labs-boton-claro" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
          <button
            type="button"
            className={`labs-boton ${peligro ? 'labs-boton-peligro' : 'labs-boton-primario'}`}
            onClick={onConfirmar}
            disabled={enviando}
          >
            {enviando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
