const db = require("../models");
const Proyecto = db.Proyecto;
const GrupoMateria = db.GrupoMateria;
const EstudianteProyecto = db.EstudianteProyecto;
const DocenteProyecto = db.DocenteProyecto;
const Archivo = db.Archivo;
const Revision = db.Revision;
const Tarea = db.Tarea;
const archivoService = require("./archivo.service");

const proyectoService = {
  /**
   * Crear un nuevo proyecto
   */
  async crearProyecto(data) {
    try {
      const proyecto = await Proyecto.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        contenido: data.contenido,
        estaAprobado: data.estaAprobado || null,
        esFinal: data.esFinal !== undefined ? data.esFinal : null,
        esPublico: data.esPublico ?? false,
        idGrupoMateria: data.idGrupoMateria,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return proyecto;
    } catch (error) {
      console.error("Error en crearProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los proyectos
   */
  async obtenerProyectos() {
    try {
      const proyectos = await Proyecto.findAll({
        include: [
          {
            model: GrupoMateria,
            as: "grupoMateria",
            attributes: ["idGrupoMateria"],
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return proyectos;
    } catch (error) {
      console.error("Error en obtenerProyectos:", error);
      throw error;
    }
  },

  /**
   * Obtener un proyecto por ID con todas sus relaciones
   */
  async obtenerProyectoPorId(idProyecto) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto, {
        include: [
          {
            model: GrupoMateria,
            as: "grupoMateria",
            include: [
              {
                model: db.Materia,
                as: "materia",
                attributes: ["nombre"],
              },
              {
                model: db.Grupo,
                as: "grupo",
                attributes: ["sigla"],
              },
              {
                model: db.Docente,
                as: "docente",
                include: [
                  {
                    model: db.Usuario,
                    as: "usuario",
                    attributes: ["nombre", "apellido"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      // Obtener URLs firmadas de los archivos
      let urlLogo = null;
      let urlTriptico = null;
      let urlBanner = null;

      try {
        const logo = await archivoService.obtenerArchivoPorTipo(
          idProyecto,
          "logo"
        );
        urlLogo = logo ? logo.urlFirmada : null;
      } catch (error) {
        console.log(`No se encontró logo para proyecto ${idProyecto}`);
      }

      try {
        const triptico = await archivoService.obtenerArchivoPorTipo(
          idProyecto,
          "triptico"
        );
        urlTriptico = triptico ? triptico.urlFirmada : null;
      } catch (error) {
        console.log(`No se encontró tríptico para proyecto ${idProyecto}`);
      }

      try {
        const banner = await archivoService.obtenerArchivoPorTipo(
          idProyecto,
          "banner"
        );
        urlBanner = banner ? banner.urlFirmada : null;
      } catch (error) {
        console.log(`No se encontró banner para proyecto ${idProyecto}`);
      }

      // Formatear respuesta
      const proyectoFormateado = {
        idProyecto: proyecto.idProyecto,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        estaAprobado: proyecto.estaAprobado,
        estaAprobadoTutor: proyecto.estaAprobadoTutor,
        esFinal: proyecto.esFinal,
        esPublico: proyecto.esPublico,
        fechaCreacion: proyecto.fechaCreacion,
        fechaActualizacion: proyecto.fechaActualizacion,
        nombreDocente: proyecto.grupoMateria?.docente?.usuario
          ? `${proyecto.grupoMateria.docente.usuario.nombre} ${proyecto.grupoMateria.docente.usuario.apellido}`
          : null,
        nombreMateria: proyecto.grupoMateria?.materia?.nombre || null,
        grupo: proyecto.grupoMateria?.grupo?.sigla || null,
        urlLogo: urlLogo,
        urlTriptico: urlTriptico,
        urlBanner: urlBanner,
      };

      return proyectoFormateado;
    } catch (error) {
      console.error("Error en obtenerProyectoPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar un proyecto
   */
  async actualizarProyecto(idProyecto, data) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      await proyecto.update({
        nombre: data.nombre || proyecto.nombre,
        descripcion: data.descripcion || proyecto.descripcion,
        contenido: data.contenido || proyecto.contenido,
        estaAprobado:
          data.estaAprobado !== undefined
            ? data.estaAprobado
            : proyecto.estaAprobada,
        esFinal: data.esFinal !== undefined ? data.esFinal : proyecto.esFinal,
        esPublico:
          data.esPublico !== undefined ? data.esPublico : proyecto.esPublico,
        idGrupoMateria: data.idGrupoMateria || proyecto.idGrupoMateria,
        fechaActualizacion: new Date(),
      });

      return proyecto;
    } catch (error) {
      console.error("Error en actualizarProyecto:", error);
      throw error;
    }
  },

  /**
   * Eliminar un proyecto
   */
  async eliminarProyecto(idProyecto) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      await proyecto.destroy();

      return { mensaje: "Proyecto eliminado exitosamente" };
    } catch (error) {
      console.error("Error en eliminarProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos por convocatoria
   */
  async obtenerProyectosPorConvocatoria(idConvocatoria) {
    try {
      const proyectos = await Proyecto.findAll({
        where: { idConvocatoria },
        include: [
          {
            model: GrupoMateria,
            as: "grupoMateria",
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return proyectos;
    } catch (error) {
      console.error("Error en obtenerProyectosPorConvocatoria:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos del estudiante autenticado con datos resumidos
   */
  async obtenerMisProyectos(idUsuario) {
    try {
      // Primero obtener el estudiante del usuario
      const estudiante = await db.Estudiante.findOne({
        where: { idUsuario },
      });

      if (!estudiante) {
        throw new Error("Estudiante no encontrado");
      }

      // Obtener los proyectos del estudiante
      const estudianteProyectos = await EstudianteProyecto.findAll({
        where: {
          idEstudiante: estudiante.idEstudiante,
          invitacion: true,
          esLider: true,
        }, // Filter by invitacion: true
        include: [
          {
            model: Proyecto,
            as: "proyecto",
            include: [
              {
                model: GrupoMateria,
                as: "grupoMateria",
                include: [
                  {
                    model: db.Materia,
                    as: "materia",
                    attributes: ["nombre"],
                  },
                  {
                    model: db.Grupo,
                    as: "grupo",
                    attributes: ["sigla"],
                  },
                  {
                    model: db.Docente,
                    as: "docente",
                    include: [
                      {
                        model: db.Usuario,
                        as: "usuario",
                        attributes: ["nombre", "apellido"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Mapear los datos a formato simplificado
      const proyectosFormateados = await Promise.all(
        estudianteProyectos.map(async (ep) => {
          const proyecto = ep.proyecto;
          const grupoMateria = proyecto.grupoMateria;

          // Obtener logo del proyecto (si existe)
          let urlLogo = null;
          try {
            const logo = await archivoService.obtenerArchivoPorTipo(
              proyecto.idProyecto,
              "logo"
            );
            urlLogo = logo ? logo.urlFirmada : null;
          } catch (error) {
            console.log(
              `No se encontró logo para proyecto ${proyecto.idProyecto}`
            );
          }

          return {
            idProyecto: proyecto.idProyecto,
            nombre: proyecto.nombre,
            descripcion: proyecto.descripcion,
            materia: grupoMateria?.materia?.nombre || "Sin materia",
            grupo: grupoMateria?.grupo?.sigla || "Sin grupo",
            nombreDocente: grupoMateria?.docente?.usuario
              ? `${grupoMateria.docente.usuario.nombre} ${grupoMateria.docente.usuario.apellido}`
              : "Sin docente",
            urlLogo: urlLogo,
            estaAprobado: proyecto.estaAprobado,
            esFinal: proyecto.esFinal,
            esPublico: proyecto.esPublico,
            fechaCreacion: proyecto.fechaCreacion,
          };
        })
      );

      return proyectosFormateados;
    } catch (error) {
      console.error("Error en obtenerMisProyectos:", error);
      throw error;
    }
  },

  /**
   * Obtener convocatoria de un proyecto mediante revisiones
   */
  async obtenerConvocatoriaDeProyecto(idProyecto) {
    try {
      const revisiones = await Revision.findAll({
        where: { idProyecto },
        include: [
          {
            model: Tarea,
            as: "tarea",
            include: [
              {
                model: db.Convocatoria,
                as: "convocatoria",
              },
            ],
          },
        ],
      });

      const convocatoria = revisiones.find(
        (revision) => revision.tarea.convocatoria
      )?.tarea.convocatoria;

      if (!convocatoria) {
        throw new Error("No se encontró convocatoria para el proyecto");
      }

      return convocatoria;
    } catch (error) {
      console.error("Error en obtenerConvocatoriaDeProyecto:", error);
      throw error;
    }
  },
  /**
   * Obtener integrantes de un proyecto con invitacion: true
   */
  async obtenerIntegrantesProyecto(idProyecto) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      const estudiantesProyecto = await EstudianteProyecto.findAll({
        where: { idProyecto, invitacion: true }, // Filter by invitacion: true
        include: [
          {
            model: db.Estudiante,
            as: "estudiante",
            include: [
              {
                model: db.Usuario,
                as: "usuario",
                attributes: ["idUsuario", "nombre", "apellido"],
              },
            ],
            attributes: ["codigoEstudiante", "idEstudiante"],
          },
        ],
      });

      const integrantes = estudiantesProyecto.map((ep) => ({
        idEstudianteProyecto: ep.idEstudianteProyecto,
        codigo: ep.estudiante.codigoEstudiante,
        nombreCompleto: `${ep.estudiante.usuario.nombre} ${ep.estudiante.usuario.apellido}`,
        esLider: ep.esLider || false,
        idUsuario: ep.estudiante.usuario.idUsuario,
      }));

      return integrantes;
    } catch (error) {
      console.error("Error en obtenerIntegrantesProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las invitaciones enviadas de un proyecto
   */
  async obtenerInvitacionesProyecto(idProyecto) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      const invitaciones = await EstudianteProyecto.findAll({
        where: { idProyecto, esLider: false }, // Filter by esLider: false
        include: [
          {
            model: db.Estudiante,
            as: "estudiante",
            include: [
              {
                model: db.Usuario,
                as: "usuario",
                attributes: ["idUsuario", "nombre", "apellido"],
              },
            ],
            attributes: ["codigoEstudiante", "idEstudiante"],
          },
        ],
      });

      const formattedInvitaciones = invitaciones.map((inv) => ({
        idEstudianteProyecto: inv.idEstudianteProyecto,
        codigo: inv.estudiante.codigoEstudiante,
        nombreCompleto: `${inv.estudiante.usuario.nombre} ${inv.estudiante.usuario.apellido}`,
        invitacion: inv.invitacion,
      }));

      return formattedInvitaciones;
    } catch (error) {
      console.error("Error en obtenerInvitacionesProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener tareas organizadas por estado
   */
  async obtenerTareasOrganizadas(idProyecto) {
    try {
      // Obtener el proyecto con sus revisiones
      const proyecto = await Proyecto.findByPk(idProyecto, {
        include: [
          {
            model: Revision,
            as: "revisiones",
            include: [
              {
                model: Tarea,
                as: "tarea",
              },
            ],
          },
        ],
      });

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      // Obtener la feria del proyecto (a través de la primera revisión)
      if (!proyecto.revisiones || proyecto.revisiones.length === 0) {
        return {
          enProceso: [],
          completado: [],
          pendiente: [],
        };
      }

      const idFeria = proyecto.revisiones[0].tarea.idFeria;

      // Obtener todas las tareas de la feria
      const todasLasTareas = await Tarea.findAll({
        where: { idFeria },
        order: [["orden", "ASC"]],
      });

      // Crear un mapa de revisiones por orden de tarea
      const revisionesPorOrden = {};
      proyecto.revisiones.forEach((revision) => {
        revisionesPorOrden[revision.tarea.orden] = revision;
      });

      // Organizar las tareas
      const completado = [];
      const enProceso = [];
      const pendiente = [];

      let siguienteTareaEnProceso = null;

      for (const tarea of todasLasTareas) {
        const revision = revisionesPorOrden[tarea.orden];
        const tareaFormateada = {
          orden: tarea.orden,
          nombre: tarea.nombre,
          descripcion: tarea.descripcion,
          fechaLimite: tarea.fechaLimite,
          idTarea: tarea.idTarea,
          esFinal: tarea.esFinal,
        };

        if (revision && revision.revisado) {
          // Tarea completada
          completado.push(tareaFormateada);
        } else if (revision && !revision.revisado) {
          // Tarea en proceso (la que está siendo revisada)
          if (siguienteTareaEnProceso === null) {
            siguienteTareaEnProceso = { ...tareaFormateada, enRevision: true };
          }
        } else {
          // Tarea pendiente (no tiene revisión)
          if (
            siguienteTareaEnProceso === null &&
            completado.length === tarea.orden
          ) {
            // Esta es la siguiente tarea a realizar
            siguienteTareaEnProceso = tareaFormateada;
          } else {
            pendiente.push(tareaFormateada);
          }
        }
      }

      // Si hay una tarea en proceso, agregarla a la lista
      if (siguienteTareaEnProceso) {
        enProceso.push(siguienteTareaEnProceso);
      }

      return {
        enProceso,
        completado,
        pendiente,
      };
    } catch (error) {
      console.error("Error en obtenerTareasOrganizadas:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos donde el estudiante tiene invitación pendiente
   */
  async obtenerProyectosConInvitacionPendiente(idUsuario) {
    try {
      // Obtener el estudiante del usuario
      const estudiante = await db.Estudiante.findOne({
        where: { idUsuario },
      });

      if (!estudiante) {
        throw new Error("Estudiante no encontrado");
      }

      // Obtener los proyectos donde el estudiante tiene invitación aceptada y no es líder
      const estudianteProyectos = await EstudianteProyecto.findAll({
        where: {
          idEstudiante: estudiante.idEstudiante,
          invitacion: true,
          esLider: false,
        },
        include: [
          {
            model: Proyecto,
            as: "proyecto",
            include: [
              {
                model: GrupoMateria,
                as: "grupoMateria",
                include: [
                  {
                    model: db.Materia,
                    as: "materia",
                    attributes: ["nombre"],
                  },
                  {
                    model: db.Grupo,
                    as: "grupo",
                    attributes: ["sigla"],
                  },
                  {
                    model: db.Docente,
                    as: "docente",
                    include: [
                      {
                        model: db.Usuario,
                        as: "usuario",
                        attributes: ["nombre", "apellido"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Mapear los datos a formato simplificado
      const proyectosFormateados = await Promise.all(
        estudianteProyectos.map(async (ep) => {
          const proyecto = ep.proyecto;
          const grupoMateria = proyecto.grupoMateria;

          // Obtener logo del proyecto (si existe)
          let urlLogo = null;
          try {
            const logo = await archivoService.obtenerArchivoPorTipo(
              proyecto.idProyecto,
              "logo"
            );
            urlLogo = logo ? logo.urlFirmada : null;
          } catch (error) {
            console.log(
              `No se encontró logo para proyecto ${proyecto.idProyecto}`
            );
          }

          return {
            idProyecto: proyecto.idProyecto,
            nombre: proyecto.nombre,
            descripcion: proyecto.descripcion,
            urlLogo,
            materia: grupoMateria?.materia?.nombre || "Sin materia",
            grupo: grupoMateria?.grupo?.sigla || "Sin grupo",
            nombreDocente: grupoMateria?.docente?.usuario
              ? `${grupoMateria.docente.usuario.nombre} ${grupoMateria.docente.usuario.apellido}`
              : "Sin docente",
            estaAprobado: proyecto.estaAprobado,
            esFinal: proyecto.esFinal,
            fechaCreacion: proyecto.fechaCreacion,
          };
        })
      );

      return proyectosFormateados;
    } catch (error) {
      console.error("Error en obtenerProyectosConInvitacionPendiente:", error);
      throw error;
    }
  },

  /**
   * Obtener contenido del proyecto para el editor
   * Incluye el contenido JSON y las imágenes con URLs firmadas
   */
  async obtenerContenidoEditor(idProyecto) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto, {
        attributes: ["idProyecto", "nombre", "contenido"],
      });

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      // Obtener imágenes de tipo "contenido" con URLs firmadas
      const imagenes = await archivoService.obtenerArchivosPorProyecto(
        idProyecto
      );
      const imagenesContenido = imagenes.filter(
        (img) => img.tipo === "contenido"
      );

      return {
        idProyecto: proyecto.idProyecto,
        nombre: proyecto.nombre,
        contenido: proyecto.contenido,
        imagenes: imagenesContenido,
      };
    } catch (error) {
      console.error("Error en obtenerContenidoEditor:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos aprobados para feria (esFinal = true) de la feria activa
   */
  async obtenerProyectosAprobadosFeria() {
    try {
      const { QueryTypes } = require("sequelize");

      // Consulta SQL única optimizada con todos los datos necesarios
      const resultado = await db.sequelize.query(
        `
        WITH FeriaActiva AS (
          SELECT "idFeria" 
          FROM "Feria" 
          WHERE "estaActivo" = true 
          LIMIT 1
        ),
        ProyectosAprobados AS (
          SELECT DISTINCT p."idProyecto", p.nombre, p.descripcion
          FROM "Proyecto" p
          INNER JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
          INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
          INNER JOIN FeriaActiva fa ON t."idFeria" = fa."idFeria"
          WHERE p."esFinal" = true
        )
        SELECT 
          pa."idProyecto",
          pa.nombre,
          pa.descripcion,
          json_agg(
            DISTINCT jsonb_build_object(
              'idEstudianteProyecto', ep."idEstudianteProyecto",
              'codigo', e."codigoEstudiante",
              'nombreCompleto', u.nombre || ' ' || u.apellido,
              'esLider', ep."esLider",
              'idUsuario', u."idUsuario"
            )
          ) FILTER (WHERE ep."idEstudianteProyecto" IS NOT NULL) as integrantes,
          json_agg(
            DISTINCT jsonb_build_object(
              'idDocenteProyecto', dp."idDocenteProyecto",
              'idDocente', dp."idDocente",
              'nombreCompleto', ud.nombre || ' ' || ud.apellido,
              'esTutor', dp."esTutor"
            )
          ) FILTER (WHERE dp."idDocenteProyecto" IS NOT NULL) as jurados,
          COUNT(DISTINCT dp."idDocenteProyecto") as "cantidadJurados"
        FROM ProyectosAprobados pa
        LEFT JOIN "EstudianteProyecto" ep ON ep."idProyecto" = pa."idProyecto" AND ep.invitacion = true
        LEFT JOIN "Estudiante" e ON e."idEstudiante" = ep."idEstudiante"
        LEFT JOIN "Usuario" u ON u."idUsuario" = e."idUsuario"
        LEFT JOIN "DocenteProyecto" dp ON dp."idProyecto" = pa."idProyecto"
        LEFT JOIN "Docente" d ON d."idDocente" = dp."idDocente"
        LEFT JOIN "Usuario" ud ON ud."idUsuario" = d."idUsuario"
        GROUP BY pa."idProyecto", pa.nombre, pa.descripcion
        ORDER BY pa."idProyecto"
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      // Formatear el resultado
      return resultado.map((proyecto) => ({
        idProyecto: proyecto.idProyecto,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        integrantes: (proyecto.integrantes || []).map((i) => ({
          idEstudianteProyecto: i.idEstudianteProyecto,
          codigo: i.codigo || "Sin código",
          nombreCompleto: i.nombreCompleto || "Sin nombre",
          esLider: i.esLider,
          idUsuario: i.idUsuario,
        })),
        jurados: (proyecto.jurados || []).map((j) => ({
          idDocenteProyecto: j.idDocenteProyecto,
          idDocente: j.idDocente,
          nombreCompleto: j.nombreCompleto || "Sin nombre",
          esTutor: j.esTutor,
        })),
        cantidadJurados: parseInt(proyecto.cantidadJurados) || 0,
      }));
    } catch (error) {
      console.error("Error en obtenerProyectosAprobadosFeria:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos de una materia específica (solo de feria activa)
   */
  async obtenerProyectosPorMateria(idMateria) {
    try {
      const { QueryTypes } = require("sequelize");

      // Obtener feria activa
      const feriaActiva = await db.Feria.findOne({
        where: { estaActivo: true },
      });

      if (!feriaActiva) {
        // Si no hay feria activa, retornar array vacío
        return [];
      }

      const proyectos = await db.sequelize.query(
        `
        SELECT DISTINCT
          p."idProyecto",
          p.nombre,
          p.descripcion,
          p."estaAprobadoTutor",
          p."fechaCreacion",
          gm."idGrupoMateria",
          g.sigla as "grupoSigla"
        FROM "Proyecto" p
        INNER JOIN "GrupoMateria" gm ON gm."idGrupoMateria" = p."idGrupoMateria"
        INNER JOIN "Materia" m ON m."idMateria" = gm."idMateria"
        INNER JOIN "Grupo" g ON g."idGrupo" = gm."idGrupo"
        INNER JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
        INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        INNER JOIN "Feria" f ON f."idFeria" = t."idFeria"
        WHERE m."idMateria" = :idMateria
          AND f."idFeria" = :idFeria
        ORDER BY p."fechaCreacion" DESC
        `,
        {
          replacements: {
            idMateria,
            idFeria: feriaActiva.idFeria,
          },
          type: QueryTypes.SELECT,
        }
      );

      return proyectos;
    } catch (error) {
      console.error("Error en obtenerProyectosPorMateria:", error);
      throw error;
    }
  },

  /**
   * Actualizar el estado de aprobación del tutor (estaAprobadoTutor)
   * @param {string} idProyecto - ID del proyecto
   * @param {boolean} estaAprobado - true para aprobar, false para rechazar
   * @returns {Promise<void>}
   */
  async actualizarProyectoAprobadoTutor(idProyecto, estaAprobado) {
    try {
      const proyecto = await Proyecto.findByPk(idProyecto);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      await proyecto.update({
        estaAprobadoTutor: estaAprobado,
      });

      return;
    } catch (error) {
      console.error("Error en actualizarProyectoAprobadoTutor:", error);
      throw error;
    }
  },
};

module.exports = proyectoService;
