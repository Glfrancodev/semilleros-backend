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

// Obtener materias del docente autenticado con grupos agrupados
const obtenerMateriasDelDocente = async (idUsuario) => {
  try {
    const { QueryTypes } = require("sequelize");
    const db = require("../models");

    console.log("📝 Buscando docente para idUsuario:", idUsuario);

    // Primero obtener el idDocente a partir del idUsuario
    const docente = await db.Docente.findOne({
      where: { idUsuario },
      attributes: ["idDocente"],
    });

    if (!docente) {
      console.log("❌ No se encontró docente para este usuario");
      throw new Error("Docente no encontrado para este usuario");
    }

    console.log("👨‍🏫 Docente encontrado:", docente.idDocente);

    const materias = await db.sequelize.query(
      `
      SELECT 
        m."idMateria",
        m.nombre,
        m.sigla,
        a.nombre as "areaNombre",
        c.nombre as "categoriaNombre",
        json_agg(
          jsonb_build_object(
            'idGrupoMateria', gm."idGrupoMateria",
            'idGrupo', g."idGrupo",
            'sigla', g.sigla
          ) ORDER BY g.sigla
        ) as grupos,
        COUNT(DISTINCT g."idGrupo") as "cantidadGrupos"
      FROM "GrupoMateria" gm
      INNER JOIN "Materia" m ON m."idMateria" = gm."idMateria"
      INNER JOIN "Grupo" g ON g."idGrupo" = gm."idGrupo"
      LEFT JOIN "AreaCategoria" ac ON ac."idAreaCategoria" = m."idAreaCategoria"
      LEFT JOIN "Area" a ON a."idArea" = ac."idArea"
      LEFT JOIN "Categoria" c ON c."idCategoria" = ac."idCategoria"
      WHERE gm."idDocente" = :idDocente
      GROUP BY m."idMateria", m.nombre, m.sigla, a.nombre, c.nombre
      ORDER BY m.nombre
      `,
      {
        replacements: { idDocente: docente.idDocente },
        type: QueryTypes.SELECT,
      }
    );

    console.log("📚 Materias encontradas en BD:", materias.length);

    return materias.map((materia) => ({
      idMateria: materia.idMateria,
      nombre: materia.nombre,
      sigla: materia.sigla,
      area: materia.areaNombre || "Sin área",
      categoria: materia.categoriaNombre || "Sin categoría",
      grupos: materia.grupos || [],
      cantidadGrupos: parseInt(materia.cantidadGrupos) || 0,
    }));
  } catch (error) {
    console.error("Error en obtenerMateriasDelDocente:", error);
    throw error;
  }
};

module.exports = {
  crearGrupoMateria,
  obtenerGrupoMaterias,
  obtenerGrupoMateriaPorId,
  actualizarGrupoMateria,
  eliminarGrupoMateria,
  buscarGrupoMateriaPorGrupoYMateria,
  obtenerMateriasDelDocente,
};
