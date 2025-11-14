const { GrupoMateria } = require("../models");

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

// Buscar GrupoMateria por idGrupo e idMateria
const buscarGrupoMateriaPorGrupoYMateria = async (idGrupo, idMateria) => {
  const db = require("../models");
  const Grupo = db.Grupo;
  const Materia = db.Materia;

  const grupoMateria = await GrupoMateria.findOne({
    where: { idGrupo, idMateria },
    include: [
      {
        model: Grupo,
        as: "grupo",
      },
      {
        model: Materia,
        as: "materia",
      },
    ],
  });

  if (!grupoMateria) {
    throw new Error("GrupoMateria no encontrado");
  }

  return grupoMateria;
};

module.exports = {
  crearGrupoMateria,
  obtenerGrupoMaterias,
  obtenerGrupoMateriaPorId,
  actualizarGrupoMateria,
  eliminarGrupoMateria,
  buscarGrupoMateriaPorGrupoYMateria,
};
