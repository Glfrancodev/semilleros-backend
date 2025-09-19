const { Semestre } = require('../models');

// Crear un nuevo Semestre
const crearSemestre = async (datos) => {
  const fechaActual = new Date();
  return await Semestre.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los Semestres
const obtenerSemestres = async () => {
  return await Semestre.findAll();
};

// Obtener un Semestre por ID
const obtenerSemestrePorId = async (idSemestre) => {
  return await Semestre.findByPk(idSemestre);
};

// Actualizar un Semestre
const actualizarSemestre = async (idSemestre, datos) => {
  const fechaActual = new Date();
  return await Semestre.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idSemestre } }
  );
};

// Eliminar un Semestre (Hard delete)
const eliminarSemestre = async (idSemestre) => {
  return await Semestre.destroy({ where: { idSemestre } });
};

module.exports = {
  crearSemestre,
  obtenerSemestres,
  obtenerSemestrePorId,
  actualizarSemestre,
  eliminarSemestre,
};
