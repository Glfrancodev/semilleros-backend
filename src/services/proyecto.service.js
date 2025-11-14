const db = require("../models");
const Proyecto = db.Proyecto;
const Convocatoria = db.Convocatoria;
const GrupoMateria = db.GrupoMateria;
const EstudianteProyecto = db.EstudianteProyecto;
const DocenteProyecto = db.DocenteProyecto;
const Archivo = db.Archivo;
const Revision = db.Revision;
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
        estaAprobado: data.estaAprobado || false,
        esFinal: data.esFinal || false,
        idGrupoMateria: data.idGrupoMateria,
        idConvocatoria: data.idConvocatoria,
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
            model: Convocatoria,
            as: "convocatoria",
            attributes: ["idConvocatoria", "nombre", "semestre", "año"],
          },
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
            model: Convocatoria,
            as: "convocatoria",
          },
          {
            model: GrupoMateria,
            as: "grupoMateria",
          },
          {
            model: EstudianteProyecto,
            as: "estudiantesProyecto",
          },
          {
            model: DocenteProyecto,
            as: "docentesProyecto",
          },
          {
            model: Archivo,
            as: "archivos",
          },
          {
            model: Revision,
            as: "revisiones",
          },
        ],
      });

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      return proyecto;
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
            : proyecto.estaAprobado,
        esFinal: data.esFinal !== undefined ? data.esFinal : proyecto.esFinal,
        idGrupoMateria: data.idGrupoMateria || proyecto.idGrupoMateria,
        idConvocatoria: data.idConvocatoria || proyecto.idConvocatoria,
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
            model: Convocatoria,
            as: "convocatoria",
          },
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
        where: { idEstudiante: estudiante.idEstudiante },
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
};

module.exports = proyectoService;
