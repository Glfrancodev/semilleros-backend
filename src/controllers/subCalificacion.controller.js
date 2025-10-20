const subCalificacionService = require("../services/subCalificacion.service");

const subCalificacionController = {
  /**
   * POST /api/sub-calificaciones
   * Crear una nueva subcalificación
   */
  async crearSubCalificacion(req, res) {
    try {
      const { nombre, maximoPuntaje, idTipoCalificacion } = req.body;

      if (!nombre || maximoPuntaje === undefined || !idTipoCalificacion) {
        return res.status(400).json({
          error:
            "Los campos nombre, maximoPuntaje e idTipoCalificacion son requeridos",
        });
      }

      // Validar que maximoPuntaje sea mayor a 0
      const maximoPuntajeNum = Number(maximoPuntaje);
      if (isNaN(maximoPuntajeNum) || maximoPuntajeNum <= 0) {
        return res.status(400).json({
          error: "El campo maximoPuntaje debe ser un número mayor a 0",
        });
      }

      // Validación de sumatoria de puntajes máximos
      const subCalificaciones =
        await subCalificacionService.obtenerSubCalificacionesPorTipo(
          idTipoCalificacion
        );
      const sumaActual = subCalificaciones.reduce(
        (acc, sc) => acc + (sc.maximoPuntaje || 0),
        0
      );
      if (sumaActual + maximoPuntajeNum > 100) {
        return res.status(400).json({
          error: `La sumatoria de puntajes máximos para este tipoCalificacion excede 100. Puntaje disponible: ${
            100 - sumaActual
          }`,
        });
      }

      const subCalificacion = await subCalificacionService.crearSubCalificacion(
        req.body
      );

      return res.status(201).json({
        mensaje: "Subcalificación creada exitosamente",
        subCalificacion,
      });
    } catch (error) {
      console.error("Error al crear subcalificación:", error);
      return res.status(500).json({
        error: error.message || "Error al crear la subcalificación",
      });
    }
  },

  /**
   * GET /api/sub-calificaciones
   * Obtener todas las subcalificaciones
   */
  async obtenerSubCalificaciones(req, res) {
    try {
      const subCalificaciones =
        await subCalificacionService.obtenerSubCalificaciones();

      return res.status(200).json({
        mensaje: "Subcalificaciones obtenidas exitosamente",
        cantidad: subCalificaciones.length,
        subCalificaciones,
      });
    } catch (error) {
      console.error("Error al obtener subcalificaciones:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las subcalificaciones",
      });
    }
  },

  /**
   * GET /api/sub-calificaciones/:idSubCalificacion
   * Obtener una subcalificación por ID
   */
  async obtenerSubCalificacionPorId(req, res) {
    try {
      const { idSubCalificacion } = req.params;

      const subCalificacion =
        await subCalificacionService.obtenerSubCalificacionPorId(
          idSubCalificacion
        );

      return res.status(200).json({
        mensaje: "Subcalificación obtenida exitosamente",
        subCalificacion,
      });
    } catch (error) {
      console.error("Error al obtener subcalificación:", error);

      if (error.message === "Subcalificación no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al obtener la subcalificación",
      });
    }
  },

  /**
   * GET /api/sub-calificaciones/tipo/:idTipoCalificacion
   * Obtener subcalificaciones por tipo
   */
  async obtenerSubCalificacionesPorTipo(req, res) {
    try {
      const { idTipoCalificacion } = req.params;

      const subCalificaciones =
        await subCalificacionService.obtenerSubCalificacionesPorTipo(
          idTipoCalificacion
        );

      return res.status(200).json({
        mensaje: "Subcalificaciones obtenidas exitosamente",
        cantidad: subCalificaciones.length,
        subCalificaciones,
      });
    } catch (error) {
      console.error("Error al obtener subcalificaciones:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las subcalificaciones",
      });
    }
  },

  /**
   * PUT /api/sub-calificaciones/:idSubCalificacion
   * Actualizar una subcalificación
   */
  async actualizarSubCalificacion(req, res) {
    try {
      const { idSubCalificacion } = req.params;
      const { maximoPuntaje, idTipoCalificacion } = req.body;

      // Validación solo si se actualiza el puntaje o el tipo
      if (maximoPuntaje !== undefined || idTipoCalificacion !== undefined) {
        // Obtener la subCalificación actual
        const subActual =
          await subCalificacionService.obtenerSubCalificacionPorId(
            idSubCalificacion
          );
        const tipoId = idTipoCalificacion || subActual.idTipoCalificacion;

        // Convertir maximoPuntaje a número si está presente
        let nuevoPuntajeNum;
        if (maximoPuntaje !== undefined) {
          nuevoPuntajeNum = Number(maximoPuntaje);
          if (isNaN(nuevoPuntajeNum) || nuevoPuntajeNum <= 0) {
            return res.status(400).json({
              error: "El campo maximoPuntaje debe ser un número mayor a 0",
            });
          }
        } else {
          nuevoPuntajeNum = subActual.maximoPuntaje;
        }

        // Obtener todas las subCalificaciones del tipo
        const subCalificaciones =
          await subCalificacionService.obtenerSubCalificacionesPorTipo(tipoId);
        // Sumar todos menos el actual
        const sumaSinActual = subCalificaciones.reduce(
          (acc, sc) =>
            sc.idSubCalificacion === idSubCalificacion
              ? acc
              : acc + (sc.maximoPuntaje || 0),
          0
        );

        if (sumaSinActual + nuevoPuntajeNum > 100) {
          return res.status(400).json({
            error: `La sumatoria de puntajes máximos para este tipoCalificacion excede 100. Puntaje disponible: ${
              100 - sumaSinActual
            }`,
          });
        }
      }

      const subCalificacion =
        await subCalificacionService.actualizarSubCalificacion(
          idSubCalificacion,
          req.body
        );

      return res.status(200).json({
        mensaje: "Subcalificación actualizada exitosamente",
        subCalificacion,
      });
    } catch (error) {
      console.error("Error al actualizar subcalificación:", error);

      if (error.message === "Subcalificación no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al actualizar la subcalificación",
      });
    }
  },

  /**
   * DELETE /api/sub-calificaciones/:idSubCalificacion
   * Eliminar una subcalificación
   */
  async eliminarSubCalificacion(req, res) {
    try {
      const { idSubCalificacion } = req.params;

      const resultado = await subCalificacionService.eliminarSubCalificacion(
        idSubCalificacion
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al eliminar subcalificación:", error);

      if (error.message === "Subcalificación no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al eliminar la subcalificación",
      });
    }
  },
};

module.exports = subCalificacionController;
