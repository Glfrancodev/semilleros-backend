const { EstudianteEvento } = require("../models");

// Crear un nuevo EstudianteEvento
const crearEstudianteEvento = async (datos) => {
  // Verificar si ya existe una inscripción
  const inscripcionExistente = await EstudianteEvento.findOne({
    where: {
      idEstudiante: datos.idEstudiante,
      idEvento: datos.idEvento,
    },
  });

  if (inscripcionExistente) {
    throw new Error("El estudiante ya está inscrito en este evento");
  }

  const fechaActual = new Date();
  return await EstudianteEvento.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los EstudianteEventos
const obtenerEstudianteEventos = async () => {
  return await EstudianteEvento.findAll();
};

// Obtener un EstudianteEvento por ID
const obtenerEstudianteEventoPorId = async (idEstudianteEvento) => {
  return await EstudianteEvento.findByPk(idEstudianteEvento);
};

// Eliminar un EstudianteEvento
const eliminarEstudianteEvento = async (idEstudianteEvento) => {
  return await EstudianteEvento.destroy({ where: { idEstudianteEvento } });
};

module.exports = {
  crearEstudianteEvento,
  obtenerEstudianteEventos,
  obtenerEstudianteEventoPorId,
  eliminarEstudianteEvento,
};
