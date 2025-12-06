const { Materia, Grupo, GrupoMateria, sequelize } = require("../models");

// Crear una nueva Materia con sus grupos
const crearMateria = async (datos) => {
  const transaction = await sequelize.transaction();

  try {
    const fechaActual = new Date();
    const { grupos, ...materiaData } = datos;

    // 1. Crear la materia
    const materia = await Materia.create(
      {
        ...materiaData,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      },
      { transaction }
    );

    // 2. Si hay grupos, crearlos y vincularlos
    if (grupos && Array.isArray(grupos) && grupos.length > 0) {
      for (const grupoData of grupos) {
        // Crear el grupo
        const grupo = await Grupo.create(
          {
            sigla: grupoData.sigla,
            fechaCreacion: fechaActual,
            fechaActualizacion: fechaActual,
          },
          { transaction }
        );

        // Crear el GrupoMateria (relación entre grupo, materia y docente)
        await GrupoMateria.create(
          {
            idGrupo: grupo.idGrupo,
            idMateria: materia.idMateria,
            idDocente: grupoData.idDocente,
            fechaCreacion: fechaActual,
            fechaActualizacion: fechaActual,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Retornar la materia creada con sus grupos
    return await obtenerMateriaPorId(materia.idMateria);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Obtener todas las Materias
const obtenerMaterias = async () => {
  const db = require("../models");
  const { Docente, Usuario } = db;

  return await Materia.findAll({
    include: [
      {
        model: db.GrupoMateria,
        as: "grupoMaterias",
        include: [
          {
            model: db.Grupo,
            as: "grupo",
            attributes: ["idGrupo", "sigla"],
          },
          {
            model: Docente,
            as: "docente",
            attributes: ["idDocente", "codigoDocente"],
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "correo"],
              },
            ],
          },
        ],
      },
    ],
  });
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
