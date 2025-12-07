const calificacionService = require("../services/calificacion.service");

const calificacionController = {
  /**
   * POST /api/calificaciones
   * Crear una nueva calificación
   */
  async crearCalificacion(req, res) {
    try {
      const { puntajeObtenido, idDocenteProyecto, idSubCalificacion } =
        req.body;

      if (
        puntajeObtenido === undefined ||
        !idDocenteProyecto ||
        !idSubCalificacion
      ) {
        return res.validationError(
          "Los campos puntajeObtenido, idDocenteProyecto e idSubCalificacion son requeridos"
        );
      }

      // Validar que puntajeObtenido no sea negativo
      const puntajeObtenidoNum = Number(puntajeObtenido);
      if (isNaN(puntajeObtenidoNum) || puntajeObtenidoNum < 0) {
        return res.validationError(
          "El campo puntajeObtenido debe ser un número mayor o igual a 0"
        );
      }

      const calificacion = await calificacionService.crearCalificacion(
        req.body
      );

      return res.success("Calificación creada exitosamente", calificacion, 201);
    } catch (error) {
      console.error("Error al crear calificación:", error);
      return res.error("Error al crear la calificación", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/calificaciones
   * Obtener todas las calificaciones
   */
  async obtenerCalificaciones(req, res) {
    try {
      const calificaciones = await calificacionService.obtenerCalificaciones();
      return res.success("Calificaciones obtenidas exitosamente", {
        count: calificaciones.length,
        items: calificaciones,
      });
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      return res.error("Error al obtener las calificaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/calificaciones/:idCalificacion
   * Obtener una calificación por ID
   */
  async obtenerCalificacionPorId(req, res) {
    try {
      const { idCalificacion } = req.params;
      const calificacion = await calificacionService.obtenerCalificacionPorId(
        idCalificacion
      );
      return res.success("Calificación obtenida exitosamente", calificacion);
    } catch (error) {
      console.error("Error al obtener calificación:", error);

      if (error.message === "Calificación no encontrada") {
        return res.notFound("Calificación");
      }

      return res.error("Error al obtener la calificación", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/calificaciones/docente-proyecto/:idDocenteProyecto
   * Obtener calificaciones por DocenteProyecto
   */
  async obtenerCalificacionesPorDocenteProyecto(req, res) {
    try {
      const { idDocenteProyecto } = req.params;
      const calificaciones =
        await calificacionService.obtenerCalificacionesPorDocenteProyecto(
          idDocenteProyecto
        );
      return res.success("Calificaciones obtenidas exitosamente", {
        count: calificaciones.length,
        items: calificaciones,
      });
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      return res.error("Error al obtener las calificaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/calificaciones/sub-calificacion/:idSubCalificacion
   * Obtener calificaciones por SubCalificacion
   */
  async obtenerCalificacionesPorSubCalificacion(req, res) {
    try {
      const { idSubCalificacion } = req.params;
      const calificaciones =
        await calificacionService.obtenerCalificacionesPorSubCalificacion(
          idSubCalificacion
        );
      return res.success("Calificaciones obtenidas exitosamente", {
        count: calificaciones.length,
        items: calificaciones,
      });
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      return res.error("Error al obtener las calificaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/calificaciones/:idCalificacion
   * Actualizar una calificación
   */
  async actualizarCalificacion(req, res) {
    try {
      const { idCalificacion } = req.params;
      const { puntajeObtenido } = req.body;

      // Validar si se está actualizando el puntaje obtenido
      if (puntajeObtenido !== undefined) {
        const puntajeObtenidoNum = Number(puntajeObtenido);

        if (isNaN(puntajeObtenidoNum) || puntajeObtenidoNum < 0) {
          return res.validationError(
            "El campo puntajeObtenido debe ser un número mayor o igual a 0"
          );
        }
      }

      const calificacion = await calificacionService.actualizarCalificacion(
        idCalificacion,
        req.body
      );

      return res.success("Calificación actualizada exitosamente", calificacion);
    } catch (error) {
      console.error("Error al actualizar calificación:", error);

      if (error.message === "Calificación no encontrada") {
        return res.notFound("Calificación");
      }

      return res.error("Error al actualizar la calificación", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/calificaciones/:idCalificacion
   * Eliminar una calificación
   */
  async eliminarCalificacion(req, res) {
    try {
      const { idCalificacion } = req.params;
      await calificacionService.eliminarCalificacion(idCalificacion);
      return res.success("Calificación eliminada exitosamente", {
        idCalificacion,
      });
    } catch (error) {
      console.error("Error al eliminar calificación:", error);

      if (error.message === "Calificación no encontrada") {
        return res.notFound("Calificación");
      }

      return res.error("Error al eliminar la calificación", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/calificaciones/proyecto/:idDocenteProyecto
   * Obtener todas las calificaciones de un proyecto para un docente
   */
  async obtenerCalificacionesProyecto(req, res) {
    try {
      const { idDocenteProyecto } = req.params;
      const calificaciones =
        await calificacionService.obtenerCalificacionesProyecto(
          idDocenteProyecto
        );
      return res.success(
        "Calificaciones obtenidas exitosamente",
        calificaciones
      );
    } catch (error) {
      console.error("Error al obtener calificaciones del proyecto:", error);
      return res.error("Error al obtener las calificaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * POST /api/calificaciones/calificar/:idDocenteProyecto
   * Calificar un proyecto (actualizar múltiples calificaciones)
   */
  async calificarProyecto(req, res) {
    try {
      const { idDocenteProyecto } = req.params;
      const { calificaciones } = req.body;

      if (!calificaciones || !Array.isArray(calificaciones)) {
        return res.validationError(
          "El campo calificaciones es requerido y debe ser un arreglo"
        );
      }

      // Validar que cada calificación tenga los campos requeridos
      for (const cal of calificaciones) {
        if (!cal.idCalificacion || cal.puntajeObtenido === undefined) {
          return res.validationError(
            "Cada calificación debe tener idCalificacion y puntajeObtenido"
          );
        }

        const puntajeNum = Number(cal.puntajeObtenido);
        if (isNaN(puntajeNum) || puntajeNum < 0) {
          return res.validationError(
            "El puntajeObtenido debe ser un número mayor o igual a 0"
          );
        }
      }

      const resultado = await calificacionService.calificarProyecto(
        idDocenteProyecto,
        calificaciones
      );

      return res.success("Proyecto calificado exitosamente", resultado);
    } catch (error) {
      console.error("Error al calificar proyecto:", error);

      if (
        error.message.includes("ya ha sido calificado") ||
        error.message.includes("no puede exceder el máximo")
      ) {
        return res.validationError(error.message);
      }

      return res.error("Error al calificar el proyecto", 500, {
        code: "CALIFICAR_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = calificacionController;
