const db = require("../models");
const Proyecto = db.Proyecto;
const Convocatoria = db.Convocatoria;
const GrupoMateria = db.GrupoMateria;
const EstudianteProyecto = db.EstudianteProyecto;
const DocenteProyecto = db.DocenteProyecto;
const Archivo = db.Archivo;
const Revision = db.Revision;

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
};

module.exports = proyectoService;
