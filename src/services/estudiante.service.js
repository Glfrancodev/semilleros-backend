const { Estudiante } = require('../models');

// Crear un nuevo Estudiante
const crearEstudiante = async (datos) => {
  const fechaActual = new Date();
  return await Estudiante.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los Estudiantes
const obtenerEstudiantes = async () => {
  return await Estudiante.findAll();
};

// Obtener un Estudiante por ID
const obtenerEstudiantePorId = async (idEstudiante) => {
  return await Estudiante.findByPk(idEstudiante);
};

// Actualizar un Estudiante
const actualizarEstudiante = async (idEstudiante, datos) => {
  const fechaActual = new Date();
  return await Estudiante.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idEstudiante } }
  );
};

// Eliminar un Estudiante (Hard delete)
const eliminarEstudiante = async (idEstudiante) => {
  return await Estudiante.destroy({ where: { idEstudiante } });
};

module.exports = {
  crearEstudiante,
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  actualizarEstudiante,
  eliminarEstudiante,
};
