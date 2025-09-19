const { Estudiante, Docente } = require('../models');

// Crear un nuevo Estudiante
const crearEstudiante = async (datos) => {
  const fechaActual = new Date();

  // Verificar si el usuario ya está asociado con un Docente
  const usuarioExistente = await Docente.findOne({
    where: { idUsuario: datos.idUsuario },
  });

  if (usuarioExistente) {
    throw new Error('Este usuario ya está asociado a un Docente. No puede ser Estudiante.');
  }

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
