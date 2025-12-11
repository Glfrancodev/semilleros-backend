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
    creadoPor: datos.creadoPor, // Guardamos creadoPor
    actualizadoPor: datos.actualizadoPor, // Guardamos actualizadoPor
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
    include: [
      {
        model: Evento.sequelize.models.Administrativo,
        as: "creador",
        include: [
          {
            model: Evento.sequelize.models.Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
        attributes: ["idAdministrativo", "codigoAdministrativo"],
      },
      {
        model: Evento.sequelize.models.Administrativo,
        as: "actualizador",
        include: [
          {
            model: Evento.sequelize.models.Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
        attributes: ["idAdministrativo", "codigoAdministrativo"],
      },
    ],
  });
};

// Obtener un Evento por ID
const obtenerEventoPorId = async (idEvento) => {
  return await Evento.findByPk(idEvento, {
    include: [
      {
        model: Evento.sequelize.models.Administrativo,
        as: "creador",
        include: [
          {
            model: Evento.sequelize.models.Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
        attributes: ["idAdministrativo", "codigoAdministrativo"],
      },
      {
        model: Evento.sequelize.models.Administrativo,
        as: "actualizador",
        include: [
          {
            model: Evento.sequelize.models.Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
        attributes: ["idAdministrativo", "codigoAdministrativo"],
      },
    ],
  });
};

// Actualizar un Evento
const actualizarEvento = async (idEvento, datos) => {
  const fechaActual = new Date();
  const datosActualizados = {
    ...datos,
    fechaActualizacion: fechaActual,
  };

  // Solo agregar actualizadoPor si está presente
  if (datos.actualizadoPor) {
    datosActualizados.actualizadoPor = datos.actualizadoPor;
  }

  return await Evento.update(datosActualizados, { where: { idEvento } });
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
