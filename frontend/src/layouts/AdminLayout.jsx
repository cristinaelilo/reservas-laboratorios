import PanelBase from '../components/PanelBase';

export default function AdminLayout() {

  const opciones = [
    'Laboratorios',
    'Reservas',
    'Usuarios',
    'Equipos',
    'Bloqueos',
    'Incidencias',
    'Notificaciones',
    'Reportes'
  ];

  const indicadores = [
    'Laboratorios disponibles',
    'Reservas totales',
    'Solicitudes pendientes',
    'Reservas aprobadas'
  ];

  return (
    <PanelBase
      titulo="Aquí tienes el resumen operativo de los laboratorios."
      opciones={opciones}
    >

      <section className="lab-indicadores">

        {indicadores.map((indicador, index) => (
          <article className="lab-indicador" key={indicador}>

            <div className={`lab-indicador-icono color-${index}`}>
              {['▣', '▦', '◷', '✓'][index]}
            </div>

            <div>
              <strong>—</strong>
              <p>{indicador}</p>
            </div>

          </article>
        ))}

      </section>

      <section className="lab-solicitudes">

        <div className="lab-solicitudes-header">
          <h2>Solicitudes recientes</h2>
          <p>Actividad que requiere tu atención.</p>
        </div>

        <div className="lab-solicitudes-vacio">
          <p>
            Las solicitudes se mostrarán cuando se
            integre el módulo de reservas.
          </p>
        </div>

      </section>

    </PanelBase>
  );
}