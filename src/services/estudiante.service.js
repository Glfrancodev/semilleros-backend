const { Estudiante, Docente } = require("../models");

// Crear un nuevo Estudiante
const crearEstudiante = async (datos) => {
  const fechaActual = new Date();

  // Verificar si el usuario ya está asociado con un Docente
  const usuarioExistente = await Docente.findOne({
    where: { idUsuario: datos.idUsuario },
  });

  if (usuarioExistente) {
    throw new Error(
      "Este usuario ya está asociado a un Docente. No puede ser Estudiante."
    );
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

// Obtener un Estudiante por idUsuario
const obtenerEstudiantePorUsuario = async (idUsuario) => {
  return await Estudiante.findOne({
    where: { idUsuario },
  });
};

// Obtener un Estudiante por código
const obtenerEstudiantePorCodigo = async (codigoEstudiante) => {
  return await Estudiante.findOne({
    where: { codigoEstudiante },
  });
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

/**
 * Obtiene el leaderboard de estudiantes destacados
 */
const obtenerLeaderboard = async (limite = 10) => {
  const { QueryTypes } = require("sequelize");
  const db = require("../models");

  const leaderboard = await db.sequelize.query(
    `
    WITH EstadisticasEstudiante AS (
      SELECT 
        e."idEstudiante",
        e."codigoEstudiante",
        CONCAT(u."nombre", ' ', u."apellido") as "nombreCompleto",
        u."correo" as email,
        u."instagram",
        u."linkedin",
        u."github",
        COUNT(DISTINCT ep."idProyecto") as "totalProyectos",
        COALESCE(AVG(r."puntaje"), 0) as "promedioNotas",
        COUNT(DISTINCT CASE 
          WHEN r."puntaje" >= 90 THEN ep."idProyecto" 
        END) as "proyectosGanadores"
      FROM "Estudiante" e
      INNER JOIN "Usuario" u ON e."idUsuario" = u."idUsuario"
      LEFT JOIN "EstudianteProyecto" ep ON e."idEstudiante" = ep."idEstudiante"
      LEFT JOIN "Revision" r ON ep."idProyecto" = r."idProyecto" AND r."revisado" = true
      WHERE ep."invitacion" = true
      GROUP BY e."idEstudiante", e."codigoEstudiante", u."nombre", u."apellido", u."correo", u."instagram", u."linkedin", u."github"
      HAVING COUNT(DISTINCT ep."idProyecto") > 0
    )
    SELECT 
      *,
      ROW_NUMBER() OVER (
        ORDER BY 
          "promedioNotas" DESC, 
          "proyectosGanadores" DESC, 
          "totalProyectos" DESC
      ) as posicion
    FROM EstadisticasEstudiante
    ORDER BY posicion
    LIMIT :limite
    `,
    {
      replacements: { limite },
      type: QueryTypes.SELECT,
    }
  );

  // Convertir tipos numéricos y formatear
  const leaderboardFormateado = leaderboard.map((estudiante) => ({
    idEstudiante: estudiante.idEstudiante,
    codigoEstudiante: estudiante.codigoEstudiante,
    nombreCompleto: estudiante.nombreCompleto,
    email: estudiante.email,
    redesSociales: {
      instagram: estudiante.instagram || null,
      linkedin: estudiante.linkedin || null,
      github: estudiante.github || null,
    },
    totalProyectos: parseInt(estudiante.totalProyectos),
    promedioNotas: parseFloat(estudiante.promedioNotas).toFixed(2),
    proyectosGanadores: parseInt(estudiante.proyectosGanadores),
    posicion: parseInt(estudiante.posicion),
  }));

  return leaderboardFormateado;
};

module.exports = {
  crearEstudiante,
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  obtenerEstudiantePorUsuario,
  obtenerEstudiantePorCodigo,
  actualizarEstudiante,
  eliminarEstudiante,
  obtenerLeaderboard,
};
