const calificacionService = require("../services/calificacion.service");
const subCalificacionService = require("../services/subCalificacion.service");

const calificacionController = {
  /**
   * POST /api/calificaciones
   * Crear una nueva calificación
   */
  async crearCalificacion(req, res) {
    try {
      const { puntajeObtenido, idSubCalificacion, idDocenteProyecto } =
        req.body;

      if (
        puntajeObtenido === undefined ||
        !idSubCalificacion ||
        !idDocenteProyecto
      ) {
        return res.validationError(
          "Los campos puntajeObtenido, idSubCalificacion e idDocenteProyecto son requeridos"
        );
      }

      // Validar que puntajeObtenido no sea negativo
      const puntajeObtenidoNum = Number(puntajeObtenido);
      if (isNaN(puntajeObtenidoNum) || puntajeObtenidoNum < 0) {
        return res.validationError(
          "El campo puntajeObtenido debe ser un número mayor o igual a 0"
        );
      }

      // Obtener la subCalificacion para validar el puntaje máximo
      const subCalificacion =
        await subCalificacionService.obtenerSubCalificacionPorId(
          idSubCalificacion
        );
      if (!subCalificacion) {
        return res.notFound("SubCalificación");
      }

      // Validar que el puntaje obtenido no exceda el puntaje máximo
      if (puntajeObtenidoNum > subCalificacion.maximoPuntaje) {
        return res.validationError(
          `El puntajeObtenido (${puntajeObtenidoNum}) no puede ser mayor que el puntaje máximo de la subcalificación (${subCalificacion.maximoPuntaje})`
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
      const { puntajeObtenido, idSubCalificacion } = req.body;

      // Validar si se está actualizando el puntaje obtenido o la subcalificación
      if (puntajeObtenido !== undefined || idSubCalificacion !== undefined) {
        // Obtener la calificación actual
        const calificacionActual =
          await calificacionService.obtenerCalificacionPorId(idCalificacion);

        // Determinar qué subcalificación usar
        const subCalificacionId =
          idSubCalificacion || calificacionActual.idSubCalificacion;
        const subCalificacion =
          await subCalificacionService.obtenerSubCalificacionPorId(
            subCalificacionId
          );

        if (!subCalificacion) {
          return res.notFound("SubCalificación");
        }

        // Validar el puntaje obtenido
        const puntajeObtenidoNum =
          puntajeObtenido !== undefined
            ? Number(puntajeObtenido)
            : calificacionActual.puntajeObtenido;

        if (isNaN(puntajeObtenidoNum) || puntajeObtenidoNum < 0) {
          return res.validationError(
            "El campo puntajeObtenido debe ser un número mayor o igual a 0"
          );
        }

        // Validar que el puntaje obtenido no exceda el puntaje máximo
        if (puntajeObtenidoNum > subCalificacion.maximoPuntaje) {
          return res.validationError(
            `El puntajeObtenido (${puntajeObtenidoNum}) no puede ser mayor que el puntaje máximo de la subcalificación (${subCalificacion.maximoPuntaje})`
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
};

module.exports = calificacionController;
