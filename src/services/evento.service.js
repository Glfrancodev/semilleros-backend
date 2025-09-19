const { Evento } = require('../models');

// Crear un nuevo Evento
const crearEvento = async (datos) => {
  const fechaActual = new Date();
  return await Evento.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los Eventos
const obtenerEventos = async () => {
  return await Evento.findAll();
};

// Obtener un Evento por ID
const obtenerEventoPorId = async (idEvento) => {
  return await Evento.findByPk(idEvento);
};

// Actualizar un Evento
const actualizarEvento = async (idEvento, datos) => {
  const fechaActual = new Date();
  return await Evento.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idEvento } }
  );
};

// Eliminar un Evento
const eliminarEvento = async (idEvento) => {
  return await Evento.destroy({ where: { idEvento } });
};

module.exports = {
  crearEvento,
  obtenerEventos,
  obtenerEventoPorId,
  actualizarEvento,
  eliminarEvento,
};
