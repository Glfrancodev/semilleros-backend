const { Grupo } = require('../models');

// Crear un nuevo Grupo
const crearGrupo = async (datos) => {
  const fechaActual = new Date();
  return await Grupo.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los Grupos
const obtenerGrupos = async () => {
  return await Grupo.findAll();
};

// Obtener un Grupo por ID
const obtenerGrupoPorId = async (idGrupo) => {
  return await Grupo.findByPk(idGrupo);
};

// Actualizar un Grupo
const actualizarGrupo = async (idGrupo, datos) => {
  const fechaActual = new Date();
  return await Grupo.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idGrupo } }
  );
};

// Eliminar un Grupo (Hard delete)
const eliminarGrupo = async (idGrupo) => {
  return await Grupo.destroy({ where: { idGrupo } });
};

module.exports = {
  crearGrupo,
  obtenerGrupos,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
};
