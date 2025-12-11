const { Materia, Grupo, GrupoMateria, sequelize, Administrativo, Usuario } = require("../models");

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
        creadoPor: materiaData.creadoPor,
        actualizadoPor: materiaData.actualizadoPor,
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

  const { Docente, Usuario, Administrativo } = db;

  return await Materia.findAll({
    include: [
      {
        model: db.AreaCategoria,
        as: "areaCategoria",
        attributes: ["idAreaCategoria", "idArea", "idCategoria"],
        include: [
          { model: db.Area, as: "area", attributes: ["nombre"] },
          { model: db.Categoria, as: "categoria", attributes: ["nombre"] },
        ],
      },
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
      {
        model: Administrativo,
        as: "creador",
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
      },
      {
        model: Administrativo,
        as: "actualizador",
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
      },
    ],
  });
};

// Obtener materias por semestre
const obtenerMateriasPorSemestre = async (idSemestre) => {
  const db = require("../models");
  const { Docente, Usuario } = db;

  return await Materia.findAll({
    where: { idSemestre },
    include: [
      {
        model: db.AreaCategoria,
        as: "areaCategoria",
        attributes: ["idAreaCategoria", "idArea", "idCategoria"],
        include: [
          { model: db.Area, as: "area", attributes: ["nombre"] },
          { model: db.Categoria, as: "categoria", attributes: ["nombre"] },
        ],
      },
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
      {
        model: Administrativo,
        as: "creador",
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
      },
      {
        model: Administrativo,
        as: "actualizador",
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
      },
    ],
  });
};

// Obtener una Materia por ID
const obtenerMateriaPorId = async (idMateria) => {
  return await Materia.findByPk(idMateria, {
    include: [
      {
        model: Administrativo,
        as: "creador",
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
      },
      {
        model: Administrativo,
        as: "actualizador",
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
      },
    ],
  });
};

// Actualizar una Materia
// Actualizar una Materia
const actualizarMateria = async (idMateria, datos) => {
  const transaction = await sequelize.transaction();

  try {
    const fechaActual = new Date();
    const { grupos, ...materiaData } = datos;

    // 1. Actualizar datos básicos de la materia
    const [updated] = await Materia.update(
      {
        ...materiaData,
        actualizadoPor: datos.actualizadoPor,
        fechaActualizacion: fechaActual,
      },
      { where: { idMateria }, transaction }
    );

    if (updated === 0) {
      await transaction.rollback();
      return [0];
    }

    // 2. Si se proporcionan grupos, actualizar la lista
    if (grupos && Array.isArray(grupos)) {
      // Obtener grupos actuales
      const gruposActuales = await GrupoMateria.findAll({
        where: { idMateria },
        include: [{ model: Grupo, as: "grupo" }],
        transaction,
      });

      const mapGruposActuales = new Map(); // sigla -> { idGrupoMateria, idGrupo, idDocente }
      gruposActuales.forEach((gm) => {
        mapGruposActuales.set(gm.grupo.sigla, {
          idGrupoMateria: gm.idGrupoMateria,
          idGrupo: gm.idGrupo,
          idDocente: gm.idDocente,
        });
      });

      const siglasNuevas = new Set(grupos.map((g) => g.sigla));

      // A. Identificar grupos a ELIMINAR (están en actuales pero no en nuevos)
      for (const [sigla, info] of mapGruposActuales) {
        if (!siglasNuevas.has(sigla)) {
          await GrupoMateria.destroy({
            where: { idGrupoMateria: info.idGrupoMateria },
            transaction,
          });
          // Opcional: Eliminar el Grupo si se desea limpiar, pero por seguridad solo quitamos la relación
          // await Grupo.destroy({ where: { idGrupo: info.idGrupo }, transaction });
        }
      }

      // B. Identificar grupos a CREAR o ACTUALIZAR
      for (const grupoData of grupos) {
        if (mapGruposActuales.has(grupoData.sigla)) {
          // ACTUALIZAR: Si existe, verificar si cambió el docente
          const infoActual = mapGruposActuales.get(grupoData.sigla);
          if (infoActual.idDocente !== grupoData.idDocente) {
            await GrupoMateria.update(
              {
                idDocente: grupoData.idDocente,
                fechaActualizacion: fechaActual,
              },
              {
                where: { idGrupoMateria: infoActual.idGrupoMateria },
                transaction,
              }
            );
          }
        } else {
          // CREAR: No existe, crear Grupo y GrupoMateria
          const nuevoGrupo = await Grupo.create(
            {
              sigla: grupoData.sigla,
              fechaCreacion: fechaActual,
              fechaActualizacion: fechaActual,
            },
            { transaction }
          );

          await GrupoMateria.create(
            {
              idGrupo: nuevoGrupo.idGrupo,
              idMateria: idMateria,
              idDocente: grupoData.idDocente,
              fechaCreacion: fechaActual,
              fechaActualizacion: fechaActual,
            },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();
    return [updated];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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
  obtenerMateriasPorSemestre,
  obtenerMateriaPorId,
  actualizarMateria,
  eliminarMateria,
  obtenerGruposPorMateria,
};
