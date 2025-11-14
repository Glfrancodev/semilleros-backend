const db = require("../models");
const Tarea = db.Tarea;
const Revision = db.Revision;
const Feria = db.Feria;

const tareaService = {
  /**
   * Crear una nueva tarea
   */
  async crearTarea(data) {
    try {
      const tarea = await Tarea.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        fechaLimite: data.fechaLimite,
        orden: data.orden !== undefined ? data.orden : 0,
        idFeria: data.idFeria,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return tarea;
    } catch (error) {
      console.error("Error en crearTarea:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las tareas
   */
  async obtenerTareas() {
    try {
      const tareas = await Tarea.findAll({
        order: [["fechaLimite", "ASC"]],
      });

      return tareas;
    } catch (error) {
      console.error("Error en obtenerTareas:", error);
      throw error;
    }
  },

  /**
   * Obtener tareas con orden 0
   */
  async obtenerTareasOrdenCero() {
    try {
      const tareas = await Tarea.findAll({
        where: { orden: 0 },
        include: [
          {
            model: Feria,
            as: "feria",
            attributes: ["idFeria", "nombre", "semestre", "año", "estaActivo"],
          },
        ],
        order: [["fechaLimite", "ASC"]],
      });

      return tareas;
    } catch (error) {
      console.error("Error en obtenerTareasOrdenCero:", error);
      throw error;
    }
  },

  /**
   * Obtener tareas por feria
   */
  async obtenerTareasPorFeria(idFeria) {
    try {
      const tareas = await Tarea.findAll({
        where: { idFeria },
        include: [
          {
            model: Feria,
            as: "feria",
            attributes: [
              "idFeria",
              "nombre",
              "descripcion",
              "semestre",
              "año",
              "estaActivo",
            ],
          },
        ],
        order: [["orden", "ASC"]],
      });

      return tareas;
    } catch (error) {
      console.error("Error en obtenerTareasPorFeria:", error);
      throw error;
    }
  },

  /**
   * Obtener una tarea por ID
   */
  async obtenerTareaPorId(idTarea) {
    try {
      const tarea = await Tarea.findByPk(idTarea, {
        include: [
          {
            model: Revision,
            as: "revisiones",
          },
        ],
      });

      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      return tarea;
    } catch (error) {
      console.error("Error en obtenerTareaPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar una tarea
   */
  async actualizarTarea(idTarea, data) {
    try {
      const tarea = await Tarea.findByPk(idTarea);

      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      await tarea.update({
        nombre: data.nombre || tarea.nombre,
        descripcion:
          data.descripcion !== undefined ? data.descripcion : tarea.descripcion,
        fechaLimite: data.fechaLimite || tarea.fechaLimite,
        orden: data.orden !== undefined ? data.orden : tarea.orden,
        idFeria: data.idFeria || tarea.idFeria,
        fechaActualizacion: new Date(),
      });

      return tarea;
    } catch (error) {
      console.error("Error en actualizarTarea:", error);
      throw error;
    }
  },

  /**
   * Eliminar una tarea
   */
  async eliminarTarea(idTarea) {
    try {
      const tarea = await Tarea.findByPk(idTarea);

      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      await tarea.destroy();

      return { mensaje: "Tarea eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarTarea:", error);
      throw error;
    }
  },
};

module.exports = tareaService;
