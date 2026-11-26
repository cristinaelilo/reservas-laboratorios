import PanelBase from '../components/PanelBase';

export default function DocenteLayout() {

  const opciones = [
    'Laboratorios',
    'Solicitar reserva',
    'Mis reservas',
    'Calendario',
    'Incidencias',
    'Notificaciones'
  ];

  return (
    <PanelBase
      titulo="Gestiona tus reservas y actividades académicas."
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