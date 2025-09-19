const { GrupoMateria } = require('../models');

// Crear una nueva GrupoMateria
const crearGrupoMateria = async (datos) => {
  const fechaActual = new Date();
  return await GrupoMateria.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los GrupoMateria
const obtenerGrupoMaterias = async () => {
  return await GrupoMateria.findAll();
};

// Obtener un GrupoMateria por ID
const obtenerGrupoMateriaPorId = async (idGrupoMateria) => {
  return await GrupoMateria.findByPk(idGrupoMateria);
};

// Actualizar un GrupoMateria
const actualizarGrupoMateria = async (idGrupoMateria, datos) => {
  const fechaActual = new Date();
  return await GrupoMateria.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idGrupoMateria } }
  );
};

// Eliminar un GrupoMateria (Hard delete)
const eliminarGrupoMateria = async (idGrupoMateria) => {
  return await GrupoMateria.destroy({ where: { idGrupoMateria } });
};

module.exports = {
  crearGrupoMateria,
  obtenerGrupoMaterias,
  obtenerGrupoMateriaPorId,
  actualizarGrupoMateria,
  eliminarGrupoMateria,
};
