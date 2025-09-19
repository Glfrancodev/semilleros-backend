const { EstudianteEvento } = require('../models');

// Crear un nuevo EstudianteEvento
const crearEstudianteEvento = async (datos) => {
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
