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
        return res.status(400).json({
          error:
            "Los campos puntajeObtenido, idSubCalificacion e idDocenteProyecto son requeridos",
        });
      }

      // Validar que puntajeObtenido no sea negativo
      const puntajeObtenidoNum = Number(puntajeObtenido);
      if (isNaN(puntajeObtenidoNum) || puntajeObtenidoNum < 0) {
        return res.status(400).json({
          error:
            "El campo puntajeObtenido debe ser un número mayor o igual a 0",
        });
      }

      // Obtener la subCalificacion para validar el puntaje máximo
      const subCalificacion =
        await subCalificacionService.obtenerSubCalificacionPorId(
          idSubCalificacion
        );
      if (!subCalificacion) {
        return res.status(404).json({
          error: "SubCalificación no encontrada",
        });
      }

      // Validar que el puntaje obtenido no exceda el puntaje máximo
      if (puntajeObtenidoNum > subCalificacion.maximoPuntaje) {
        return res.status(400).json({
          error: `El puntajeObtenido (${puntajeObtenidoNum}) no puede ser mayor que el puntaje máximo de la subcalificación (${subCalificacion.maximoPuntaje})`,
        });
      }

      const calificacion = await calificacionService.crearCalificacion(
        req.body
      );

      return res.status(201).json({
        mensaje: "Calificación creada exitosamente",
        calificacion,
      });
    } catch (error) {
      console.error("Error al crear calificación:", error);
      return res.status(500).json({
        error: error.message || "Error al crear la calificación",
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

      return res.status(200).json({
        mensaje: "Calificaciones obtenidas exitosamente",
        cantidad: calificaciones.length,
        calificaciones,
      });
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las calificaciones",
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

      return res.status(200).json({
        mensaje: "Calificación obtenida exitosamente",
        calificacion,
      });
    } catch (error) {
      console.error("Error al obtener calificación:", error);

      if (error.message === "Calificación no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al obtener la calificación",
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

      return res.status(200).json({
        mensaje: "Calificaciones obtenidas exitosamente",
        cantidad: calificaciones.length,
        calificaciones,
      });
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las calificaciones",
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

      return res.status(200).json({
        mensaje: "Calificaciones obtenidas exitosamente",
        cantidad: calificaciones.length,
        calificaciones,
      });
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las calificaciones",
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
          return res.status(404).json({
            error: "SubCalificación no encontrada",
          });
        }

        // Validar el puntaje obtenido
        const puntajeObtenidoNum =
          puntajeObtenido !== undefined
            ? Number(puntajeObtenido)
            : calificacionActual.puntajeObtenido;

        if (isNaN(puntajeObtenidoNum) || puntajeObtenidoNum < 0) {
          return res.status(400).json({
            error:
              "El campo puntajeObtenido debe ser un número mayor o igual a 0",
          });
        }

        // Validar que el puntaje obtenido no exceda el puntaje máximo
        if (puntajeObtenidoNum > subCalificacion.maximoPuntaje) {
          return res.status(400).json({
            error: `El puntajeObtenido (${puntajeObtenidoNum}) no puede ser mayor que el puntaje máximo de la subcalificación (${subCalificacion.maximoPuntaje})`,
          });
        }
      }

      const calificacion = await calificacionService.actualizarCalificacion(
        idCalificacion,
        req.body
      );

      return res.status(200).json({
        mensaje: "Calificación actualizada exitosamente",
        calificacion,
      });
    } catch (error) {
      console.error("Error al actualizar calificación:", error);

      if (error.message === "Calificación no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al actualizar la calificación",
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

      const resultado = await calificacionService.eliminarCalificacion(
        idCalificacion
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al eliminar calificación:", error);

      if (error.message === "Calificación no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al eliminar la calificación",
      });
    }
  },
};

module.exports = calificacionController;
