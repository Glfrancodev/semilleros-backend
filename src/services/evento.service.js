const { Evento, EstudianteEvento, Estudiante } = require("../models");
const { Sequelize } = require("sequelize");

// Crear un nuevo Evento
const crearEvento = async (datos) => {
  const fechaActual = new Date();
  return await Evento.create({
    ...datos,
    estaActivo: datos.estaActivo !== undefined ? datos.estaActivo : true,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los Eventos
const obtenerEventos = async () => {
  return await Evento.findAll({
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM "EstudianteEvento"
            WHERE "EstudianteEvento"."idEvento" = "Evento"."idEvento"
          )`),
          "cantidadInscritos",
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM "Estudiante"
          )`),
          "totalEstudiantes",
        ],
      ],
    },
  });
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
