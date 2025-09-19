const { Materia } = require('../models');

// Crear una nueva Materia
const crearMateria = async (datos) => {
  const fechaActual = new Date();
  return await Materia.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todas las Materias
const obtenerMaterias = async () => {
  return await Materia.findAll();
};

// Obtener una Materia por ID
const obtenerMateriaPorId = async (idMateria) => {
  return await Materia.findByPk(idMateria);
};

// Actualizar una Materia
const actualizarMateria = async (idMateria, datos) => {
  const fechaActual = new Date();
  return await Materia.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idMateria } }
  );
};

// Eliminar una Materia (Hard delete)
const eliminarMateria = async (idMateria) => {
  return await Materia.destroy({ where: { idMateria } });
};

module.exports = {
  crearMateria,
  obtenerMaterias,
  obtenerMateriaPorId,
  actualizarMateria,
  eliminarMateria,
};
