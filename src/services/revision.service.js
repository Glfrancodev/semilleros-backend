const db = require("../models");
const Revision = db.Revision;
const Proyecto = db.Proyecto;

const revisionService = {
  /**
   * Crear una nueva revisión
   */
  async crearRevision(data) {
    try {
      const revision = await Revision.create({
        puntaje: data.puntaje || null,
        comentario: data.comentario || null,
        idProyecto: data.idProyecto,
        idTarea: data.idTarea,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return revision;
    } catch (error) {
      console.error("Error en crearRevision:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las revisiones
   */
  async obtenerRevisiones() {
    try {
      const revisiones = await Revision.findAll({
        include: [
          {
            model: Proyecto,
            as: "proyecto",
            attributes: ["idProyecto", "nombre"],
          },
          {
            model: db.Archivo,
            as: "archivos",
            attributes: ["idArchivo", "nombre", "formato", "tamano"],
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return revisiones;
    } catch (error) {
      console.error("Error en obtenerRevisiones:", error);
      throw error;
    }
  },

  /**
   * Obtener una revisión por ID
   */
  async obtenerRevisionPorId(idRevision) {
    try {
      const revision = await Revision.findByPk(idRevision, {
        include: [
          {
            model: Proyecto,
            as: "proyecto",
          },
          {
            model: db.Archivo,
            as: "archivos",
          },
        ],
      });

      if (!revision) {
        throw new Error("Revisión no encontrada");
      }

      return revision;
    } catch (error) {
      console.error("Error en obtenerRevisionPorId:", error);
      throw error;
    }
  },

  /**
   * Obtener revisiones por proyecto
   */
  async obtenerRevisionesPorProyecto(idProyecto) {
    try {
      const revisiones = await Revision.findAll({
        where: { idProyecto },
        include: [
          {
            model: db.Tarea,
            as: "tarea",
            include: [
              {
                model: db.Feria,
                as: "feria",
              },
            ],
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return revisiones;
    } catch (error) {
      console.error("Error en obtenerRevisionesPorProyecto:", error);
      throw error;
    }
  },

  /**
   * Actualizar una revisión
   */
  async actualizarRevision(idRevision, data) {
    try {
      const revision = await Revision.findByPk(idRevision);

      if (!revision) {
        throw new Error("Revisión no encontrada");
      }

      await revision.update({
        puntaje: data.puntaje !== undefined ? data.puntaje : revision.puntaje,
        comentario:
          data.comentario !== undefined ? data.comentario : revision.comentario,
        fechaActualizacion: new Date(),
      });

      return revision;
    } catch (error) {
      console.error("Error en actualizarRevision:", error);
      throw error;
    }
  },

  /**
   * Eliminar una revisión
   */
  async eliminarRevision(idRevision) {
    try {
      const revision = await Revision.findByPk(idRevision);

      if (!revision) {
        throw new Error("Revisión no encontrada");
      }

      await revision.destroy();

      return { mensaje: "Revisión eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarRevision:", error);
      throw error;
    }
  },
};

module.exports = revisionService;
