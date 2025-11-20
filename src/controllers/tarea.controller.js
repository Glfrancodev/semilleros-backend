const tareaService = require("../services/tarea.service");

const tareaController = {
  /**
   * POST /api/tareas
   * Crear una nueva tarea
   */
  async crearTarea(req, res) {
    try {
      const { nombre, fechaLimite, idFeria } = req.body;

      if (!nombre || !fechaLimite || !idFeria) {
        return res.validationError(
          "Los campos nombre, fechaLimite e idFeria son requeridos"
        );
      }

      const tarea = await tareaService.crearTarea(req.body);
      return res.success({ tarea }, "Tarea creada exitosamente");
    } catch (error) {
      console.error("Error al crear tarea:", error);
      return res.error("Error al crear la tarea", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tareas
   * Obtener todas las tareas
   */
  async obtenerTareas(req, res) {
    try {
      const tareas = await tareaService.obtenerTareas();
      return res.success(
        { tareas, count: tareas.length },
        "Tareas obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      return res.error("Error al obtener las tareas", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tareas/orden/cero
   * Obtener tareas con orden 0
   */
  async obtenerTareasOrdenCero(req, res) {
    try {
      const tareas = await tareaService.obtenerTareasOrdenCero();
      return res.success(
        { tareas, count: tareas.length },
        "Tareas con orden 0 obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener tareas con orden 0:", error);
      return res.error("Error al obtener las tareas", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tareas/inscripcion
   * Obtener tareas de inscripción (alias de orden 0)
   */
  async obtenerTareasInscripcion(req, res) {
    try {
      const tareas = await tareaService.obtenerTareasOrdenCero();
      return res.success("Tareas de inscripción obtenidas exitosamente", {
        count: tareas.length,
        items: tareas,
      });
    } catch (error) {
      console.error("Error al obtener tareas de inscripción:", error);
      return res.error("Error al obtener las tareas de inscripción", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tareas/feria/:idFeria
   * Obtener tareas por feria
   */
  async obtenerTareasPorFeria(req, res) {
    try {
      const { idFeria } = req.params;
      const tareas = await tareaService.obtenerTareasPorFeria(idFeria);
      return res.success(
        { tareas, count: tareas.length },
        "Tareas de la feria obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener tareas por feria:", error);
      return res.error("Error al obtener las tareas", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tareas/:idTarea
   * Obtener una tarea por ID
   */
  async obtenerTareaPorId(req, res) {
    try {
      const { idTarea } = req.params;
      const tarea = await tareaService.obtenerTareaPorId(idTarea);
      return res.success({ tarea }, "Tarea obtenida exitosamente");
    } catch (error) {
      console.error("Error al obtener tarea:", error);

      if (error.message === "Tarea no encontrada") {
        return res.notFound("Tarea");
      }

      return res.error("Error al obtener la tarea", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tareas/:idTarea/detalle
   * Obtener detalle completo de una tarea
   */
  async obtenerDetalleTarea(req, res) {
    try {
      const { idTarea } = req.params;
      const detalle = await tareaService.obtenerDetalleTarea(idTarea);
      return res.success(detalle, "Detalle de tarea obtenido exitosamente");
    } catch (error) {
      console.error("Error al obtener detalle de tarea:", error);
      if (error.message === "Tarea no encontrada") {
        return res.notFound("Tarea");
      }
      return res.error("Error al obtener el detalle de la tarea", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/tareas/:idTarea
   * Actualizar una tarea
   */
  async actualizarTarea(req, res) {
    try {
      const { idTarea } = req.params;
      const tarea = await tareaService.actualizarTarea(idTarea, req.body);
      return res.success({ tarea }, "Tarea actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar tarea:", error);

      if (error.message === "Tarea no encontrada") {
        return res.notFound("Tarea");
      }

      return res.error("Error al actualizar la tarea", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/tareas/:idTarea
   * Eliminar una tarea
   */
  async eliminarTarea(req, res) {
    try {
      const { idTarea } = req.params;
      await tareaService.eliminarTarea(idTarea);
      return res.success("Tarea eliminada exitosamente", { idTarea });
    } catch (error) {
      console.error("Error al eliminar tarea:", error);

      if (error.message === "Tarea no encontrada") {
        return res.notFound("Tarea");
      }

      return res.error("Error al eliminar la tarea", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = tareaController;
