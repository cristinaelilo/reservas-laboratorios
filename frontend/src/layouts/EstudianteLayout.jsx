import PanelBase from '../components/PanelBase';

export default function EstudianteLayout() {

  const opciones = [
    'Laboratorios',
    'Nueva reserva',
    'Mis reservas',
    'Calendario',
    'Reportar incidencia',
    'Notificaciones'
  ];

  return (
    <PanelBase
      titulo="Consulta los laboratorios y organiza tus prácticas."
      opciones={opciones}
    >

      <section className="lab-modulos">

        {opciones.map(opcion => (
          <article className="lab-modulo" key={opcion}>
            <h3>{opcion}</h3>
            <p>Módulo del sistema</p>
          </article>
        ))}

      </section>

    </PanelBase>
  );
}