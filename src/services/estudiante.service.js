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
 * Obtiene el leaderboard de estudiantes destacados basado en ganadores de ferias finalizadas
 */
const obtenerLeaderboard = async (limite = 10) => {
  try {
    console.log("🏆 [LEADERBOARD] Iniciando consulta con límite:", limite);
    const { QueryTypes } = require("sequelize");
    const db = require("../models");

    console.log("🏆 [LEADERBOARD] Ejecutando consulta SQL...");
    const leaderboard = await db.sequelize.query(
      `
      WITH GanadoresDesglosados AS (
        SELECT 
          f."idFeria",
          f."nombre" as "nombreFeria",
          f."año",
          f."semestre",
          jsonb_array_elements(
            jsonb_path_query_array(
              f."ganadores", 
              '$.*.*.*'
            )
          ) as ganador_info
        FROM "Feria" f
        WHERE f."estado" = 'Finalizado' 
          AND f."ganadores" IS NOT NULL
          AND jsonb_typeof(f."ganadores") = 'object'
      ),
      IntegrantesGanadores AS (
        SELECT 
          gd."idFeria",
          gd."nombreFeria",
          gd."año",
          gd."semestre",
          (ganador_info->'proyecto'->>'idProyecto')::uuid as "idProyecto",
          (ganador_info->'proyecto'->>'nombreProyecto') as "nombreProyecto",
          (ganador_info->'proyecto'->>'notaPromedio')::numeric as "notaPromedio",
          jsonb_array_elements(ganador_info->'proyecto'->'integrantes') as integrante
        FROM GanadoresDesglosados gd
        WHERE ganador_info IS NOT NULL 
          AND jsonb_typeof(ganador_info) = 'object'
          AND ganador_info->'proyecto' IS NOT NULL
          AND jsonb_typeof(ganador_info->'proyecto') = 'object'
      ),
      EstadisticasEstudiante AS (
        SELECT 
          e."idEstudiante",
          e."codigoEstudiante",
          CONCAT(u."nombre", ' ', u."apellido") as "nombreCompleto",
          u."correo" as email,
          u."idFotoPerfil",
          u."instagram",
          u."linkedin",
          u."github",
          COUNT(DISTINCT ig."idProyecto") as "totalProyectosGanadores",
          COALESCE(AVG(ig."notaPromedio"), 0) as "promedioNotas",
          COUNT(DISTINCT ig."idFeria") as "feriasGanadas"
        FROM "Estudiante" e
        INNER JOIN "Usuario" u ON e."idUsuario" = u."idUsuario"
        INNER JOIN IntegrantesGanadores ig ON e."idEstudiante" = (ig.integrante->>'idEstudiante')::uuid
        GROUP BY e."idEstudiante", e."codigoEstudiante", u."nombre", u."apellido", u."correo", u."idFotoPerfil", u."instagram", u."linkedin", u."github"
        HAVING COUNT(DISTINCT ig."idProyecto") > 0
      )
      SELECT 
        *,
        ROW_NUMBER() OVER (
          ORDER BY 
            "promedioNotas" DESC,
            "totalProyectosGanadores" DESC,
            "feriasGanadas" DESC
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

    console.log(
      "🏆 [LEADERBOARD] Resultados de la consulta:",
      leaderboard.length,
      "estudiantes"
    );
    console.log(
      "🏆 [LEADERBOARD] Datos:",
      JSON.stringify(leaderboard, null, 2)
    );

    // Si no hay resultados, devolver array vacío
    if (!leaderboard || leaderboard.length === 0) {
      console.log(
        "🏆 [LEADERBOARD] No hay resultados, devolviendo array vacío"
      );
      return [];
    }

    // Generar URLs firmadas para las fotos de perfil
    const { generarUrlFirmada } = require("./archivo.service");

    console.log(
      "🏆 [LEADERBOARD] Generando URLs firmadas para",
      leaderboard.length,
      "estudiantes"
    );

    // Convertir tipos numéricos y formatear
    const leaderboardFormateado = await Promise.all(
      leaderboard.map(async (estudiante, index) => {
        console.log(
          `🏆 [LEADERBOARD] Procesando estudiante ${index + 1}:`,
          estudiante.nombreCompleto
        );
        let fotoPerfilUrl = null;
        if (estudiante.idFotoPerfil) {
          try {
            console.log(
              `🏆 [LEADERBOARD] Generando URL firmada para foto:`,
              estudiante.idFotoPerfil
            );
            const urlData = await generarUrlFirmada(estudiante.idFotoPerfil);
            // generarUrlFirmada devuelve {url: string, expiresIn: number}, solo queremos la url
            fotoPerfilUrl = urlData.url;
            console.log(`🏆 [LEADERBOARD] URL generada:`, fotoPerfilUrl);
          } catch (error) {
            console.error(
              "🏆 [LEADERBOARD] ❌ Error al generar URL firmada para estudiante:",
              estudiante.idEstudiante,
              error
            );
          }
        } else {
          console.log(`🏆 [LEADERBOARD] Estudiante sin foto de perfil`);
        }

        return {
          idEstudiante: estudiante.idEstudiante,
          codigoEstudiante: estudiante.codigoEstudiante,
          nombreCompleto: estudiante.nombreCompleto,
          email: estudiante.email,
          fotoPerfil: fotoPerfilUrl,
          redesSociales: {
            instagram: estudiante.instagram || null,
            linkedin: estudiante.linkedin || null,
            github: estudiante.github || null,
          },
          totalProyectos: parseInt(estudiante.totalProyectosGanadores),
          promedioNotas: parseFloat(estudiante.promedioNotas).toFixed(2),
          proyectosGanadores: parseInt(estudiante.totalProyectosGanadores),
          feriasGanadas: parseInt(estudiante.feriasGanadas),
          posicion: parseInt(estudiante.posicion),
        };
      })
    );

    console.log(
      "🏆 [LEADERBOARD] ✅ Leaderboard formateado exitosamente:",
      leaderboardFormateado.length,
      "estudiantes"
    );
    return leaderboardFormateado;
  } catch (error) {
    console.error("🏆 [LEADERBOARD] ❌ Error en obtenerLeaderboard:", error);
    console.error("🏆 [LEADERBOARD] Stack trace:", error.stack);
    // En caso de error, devolver array vacío en lugar de lanzar el error
    return [];
  }
};

// Obtener perfil público de un estudiante
const obtenerPerfilPublico = async (idEstudiante) => {
  const { Usuario, Rol, Archivo } = require("../models");
  const archivoService = require("./archivo.service");

  const estudiante = await Estudiante.findByPk(idEstudiante, {
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: [
          "idUsuario",
          "ci",
          "nombre",
          "apellido",
          "correo",
          "estaActivo",
          "instagram",
          "linkedin",
          "github",
          "bio",
        ],
        include: [
          {
            model: Rol,
            as: "Rol",
            attributes: ["idRol", "nombre"],
          },
          {
            model: Archivo,
            as: "fotoPerfil",
            attributes: ["idArchivo", "url", "formato"],
          },
        ],
      },
    ],
  });

  if (!estudiante || !estudiante.usuario) {
    return null;
  }

  const usuarioJSON = estudiante.usuario.toJSON();

  // Generar URL firmada para la foto de perfil
  if (usuarioJSON.fotoPerfil && usuarioJSON.fotoPerfil.idArchivo) {
    try {
      const { url: urlFirmada } = await archivoService.generarUrlFirmada(
        usuarioJSON.fotoPerfil.idArchivo,
        604800 // 7 días en segundos
      );
      usuarioJSON.fotoPerfil.url = urlFirmada;
    } catch (error) {
      console.error(
        `Error al generar URL firmada para estudiante ${idEstudiante}:`,
        error
      );
    }
  }

  // Formatear respuesta similar al perfil normal
  return {
    idUsuario: usuarioJSON.idUsuario,
    ci: usuarioJSON.ci,
    nombre: usuarioJSON.nombre,
    apellido: usuarioJSON.apellido,
    correo: usuarioJSON.correo,
    estaActivo: usuarioJSON.estaActivo,
    instagram: usuarioJSON.instagram,
    linkedin: usuarioJSON.linkedin,
    github: usuarioJSON.github,
    bio: usuarioJSON.bio,
    idRol: usuarioJSON.idRol,
    Rol: usuarioJSON.Rol,
    fotoPerfil: usuarioJSON.fotoPerfil,
    Estudiante: {
      idEstudiante: estudiante.idEstudiante,
      codigoEstudiante: estudiante.codigoEstudiante,
    },
  };
};

// Obtener proyectos calificados de un estudiante
const obtenerProyectosEstudiante = async (idEstudiante) => {
  const {
    EstudianteProyecto,
    Proyecto,
    DocenteProyecto,
    Calificacion,
    Feria,
  } = require("../models");
  const archivoService = require("./archivo.service");

  try {
    const estudianteProyectos = await EstudianteProyecto.findAll({
      where: {
        idEstudiante,
        invitacion: true, // Solo proyectos aceptados
      },
      include: [
        {
          model: Proyecto,
          as: "proyecto",
          where: {
            esFinal: true, // Solo proyectos que llegaron a la feria
          },
          required: true,
          include: [
            {
              model: DocenteProyecto,
              as: "docentesProyecto",
              required: false,
              include: [
                {
                  model: Calificacion,
                  as: "calificaciones",
                  where: { calificado: true },
                  attributes: ["puntajeObtenido", "calificado"],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    // Obtener todas las ferias para verificar ganadores
    const ferias = await Feria.findAll({
      where: { estado: "Finalizado" },
      attributes: ["idFeria", "nombre", "ganadores", "semestre", "año"],
    });

    const proyectosFormateados = await Promise.all(
      estudianteProyectos.map(async (ep) => {
        const proyecto = ep.proyecto;

        // Obtener logo del proyecto (si existe)
        let urlLogo = null;
        try {
          const logo = await archivoService.obtenerArchivoPorTipo(
            proyecto.idProyecto,
            "logo"
          );
          urlLogo = logo ? logo.urlFirmada : null;
        } catch (error) {
          // Logo no encontrado
        }

        // Calcular promedio de calificaciones de los jurados
        // Usar la misma lógica que obtenerNotaPromedioProyecto
        const jurados = proyecto.docentesProyecto || [];
        let promedio = null;

        if (jurados.length > 0) {
          const notasJurados = [];

          for (const jurado of jurados) {
            if (jurado.calificaciones && jurado.calificaciones.length > 0) {
              // Sumar todas las calificaciones de este jurado (ya están filtradas por calificado=true en el query)
              const totalPuntaje = jurado.calificaciones.reduce(
                (sum, cal) => sum + parseFloat(cal.puntajeObtenido || 0),
                0
              );
              notasJurados.push(totalPuntaje);
            }
          }

          if (notasJurados.length > 0) {
            // Calcular promedio de las notas de los jurados
            const notaPromedio =
              notasJurados.reduce((sum, nota) => sum + nota, 0) /
              notasJurados.length;
            promedio = (Math.round(notaPromedio * 100) / 100).toFixed(2);
          }
        }

        // Buscar si ganó algún lugar en alguna feria
        let lugarGanador = null;
        let nombreFeria = null;
        let areaGanadora = null;
        let categoriaGanadora = null;

        for (const feria of ferias) {
          if (feria.ganadores) {
            // Buscar en todas las áreas y categorías
            for (const [nombreArea, categoriasObj] of Object.entries(
              feria.ganadores
            )) {
              for (const [nombreCategoria, ganadores] of Object.entries(
                categoriasObj
              )) {
                // Los ganadores son objetos con estructura: { proyecto: { idProyecto, ... } }
                const primerLugarId =
                  ganadores.primerLugar?.proyecto?.idProyecto ||
                  ganadores.primerLugar;
                const segundoLugarId =
                  ganadores.segundoLugar?.proyecto?.idProyecto ||
                  ganadores.segundoLugar;
                const tercerLugarId =
                  ganadores.tercerLugar?.proyecto?.idProyecto ||
                  ganadores.tercerLugar;

                if (primerLugarId && primerLugarId === proyecto.idProyecto) {
                  lugarGanador = 1;
                  nombreFeria = feria.nombre;
                  areaGanadora = nombreArea;
                  categoriaGanadora = nombreCategoria;
                  break;
                } else if (
                  segundoLugarId &&
                  segundoLugarId === proyecto.idProyecto
                ) {
                  lugarGanador = 2;
                  nombreFeria = feria.nombre;
                  areaGanadora = nombreArea;
                  categoriaGanadora = nombreCategoria;
                  break;
                } else if (
                  tercerLugarId &&
                  tercerLugarId === proyecto.idProyecto
                ) {
                  lugarGanador = 3;
                  nombreFeria = feria.nombre;
                  areaGanadora = nombreArea;
                  categoriaGanadora = nombreCategoria;
                  break;
                }
              }
              if (lugarGanador) break;
            }
            if (lugarGanador) break;
          }
        }

        return {
          idProyecto: proyecto.idProyecto,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          urlLogo: urlLogo,
          area: areaGanadora,
          categoria: categoriaGanadora,
          promedio,
          lugarGanador,
          nombreFeria,
          esLider: ep.esLider,
        };
      })
    );

    return proyectosFormateados;
  } catch (error) {
    console.error("Error al obtener proyectos del estudiante:", error);
    return [];
  }
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
  obtenerPerfilPublico,
  obtenerProyectosEstudiante,
};
