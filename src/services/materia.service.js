const { Materia } = require("../models");

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

// Obtener todos los grupos de una materia
const obtenerGruposPorMateria = async (idMateria) => {
  const db = require("../models");
  const GrupoMateria = db.GrupoMateria;
  const Grupo = db.Grupo;

  const materia = await Materia.findByPk(idMateria);

  if (!materia) {
    throw new Error("Materia no encontrada");
  }

  const grupoMaterias = await GrupoMateria.findAll({
    where: { idMateria },
    include: [
      {
        model: Grupo,
        as: "grupo",
        attributes: ["idGrupo", "sigla"],
      },
    ],
  });

  // Retornar grupos con su idGrupoMateria
  return grupoMaterias.map((gm) => ({
    idGrupoMateria: gm.idGrupoMateria,
    idGrupo: gm.grupo.idGrupo,
    sigla: gm.grupo.sigla,
  }));
};

module.exports = {
  crearMateria,
  obtenerMaterias,
  obtenerMateriaPorId,
  actualizarMateria,
  eliminarMateria,
  obtenerGruposPorMateria,
};
