const feriaService = require("../services/feria.service");

const feriaController = {
  /**
   * POST /api/ferias
   * Crear una nueva feria
   */
  async crearFeria(req, res) {
    try {
      const { nombre, semestre, año, tipoCalificacion } = req.body;

      // Log para debug
      console.log("📝 Body recibido:", JSON.stringify(req.body, null, 2));

      if (!nombre || !semestre || !año) {
        return res.validationError(
          "Los campos nombre, semestre y año son requeridos"
        );
      }

      // Validar que se proporcione tipoCalificacion
      if (!tipoCalificacion) {
        console.error("❌ tipoCalificacion no encontrado en el body");
        return res.validationError(
          "El tipo de calificación es requerido para crear una feria"
        );
      }

      // Validar que tipoCalificacion tenga subCalificaciones
      if (
        !tipoCalificacion.subCalificaciones ||
        !Array.isArray(tipoCalificacion.subCalificaciones) ||
        tipoCalificacion.subCalificaciones.length === 0
      ) {
        console.error("❌ subCalificaciones inválidas:", tipoCalificacion);
        return res.validationError(
          "Debe proporcionar al menos una subcalificación"
        );
      }

      console.log("✅ Validaciones pasadas, creando feria...");
      const feria = await feriaService.crearFeria(req.body);

      return res.success("Feria creada exitosamente", feria, 201);
    } catch (error) {
      console.error("Error al crear feria:", error);
      return res.error("Error al crear la feria", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/ferias
   * Obtener todas las ferias
   */
  async obtenerFerias(req, res) {
    try {
      const ferias = await feriaService.obtenerFerias();

      return res.success("Ferias obtenidas exitosamente", {
        count: ferias.length,
        items: ferias,
      });
    } catch (error) {
      console.error("Error al obtener ferias:", error);
      return res.error("Error al obtener las ferias", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/ferias/:idFeria
   * Obtener una feria por ID
   */
  async obtenerFeriaPorId(req, res) {
    try {
      const { idFeria } = req.params;

      const feria = await feriaService.obtenerFeriaPorId(idFeria);

      return res.success("Feria obtenida exitosamente", feria);
    } catch (error) {
      console.error("Error al obtener feria:", error);

      if (error.message === "Feria no encontrada") {
        return res.notFound("Feria");
      }

      return res.error("Error al obtener la feria", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/ferias/:idFeria
   * Actualizar una feria
   */
  async actualizarFeria(req, res) {
    try {
      const { idFeria } = req.params;

      const feria = await feriaService.actualizarFeria(idFeria, req.body);

      return res.success("Feria actualizada exitosamente", feria);
    } catch (error) {
      console.error("Error al actualizar feria:", error);

      if (error.message === "Feria no encontrada") {
        return res.notFound("Feria");
      }

      return res.error("Error al actualizar la feria", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/ferias/:idFeria
   * Eliminar una feria
   */
  async eliminarFeria(req, res) {
    try {
      const { idFeria } = req.params;

      await feriaService.eliminarFeria(idFeria);

      return res.success("Feria eliminada exitosamente", null);
    } catch (error) {
      console.error("Error al eliminar feria:", error);

      if (error.message === "Feria no encontrada") {
        return res.notFound("Feria");
      }

      return res.error("Error al eliminar la feria", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/ferias/resumen-activa
   * Obtener resumen de la feria activa
   */
  async obtenerResumenFeriaActiva(req, res) {
    try {
      const resumen = await feriaService.obtenerResumenFeriaActiva();
      return res.success(
        "Resumen de feria activa obtenido exitosamente",
        resumen
      );
    } catch (error) {
      console.error("Error al obtener resumen de feria activa:", error);
      return res.error("Error al obtener el resumen de la feria activa", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/ferias/activa
   * Obtener la feria actualmente activa con estadísticas
   */
  async obtenerFeriaActiva(req, res) {
    try {
      const feria = await feriaService.obtenerFeriaActiva();

      if (!feria) {
        return res.success("No hay feria activa", null);
      }

      return res.success("Feria activa obtenida exitosamente", feria);
    } catch (error) {
      console.error("Error al obtener feria activa:", error);
      return res.error("Error al obtener la feria activa", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/ferias/pasadas
   * Obtener todas las ferias que NO están activas (historial)
   */
  async obtenerFeriasPasadas(req, res) {
    try {
      const ferias = await feriaService.obtenerFeriasPasadas();

      return res.success("Ferias pasadas obtenidas exitosamente", {
        count: ferias.length,
        items: ferias,
      });
    } catch (error) {
      console.error("Error al obtener ferias pasadas:", error);
      return res.error("Error al obtener ferias pasadas", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * POST /api/ferias/:idFeria/finalizar
   * Finalizar una feria y calcular ganadores automáticamente
   */
  async finalizarFeria(req, res) {
    try {
      const { idFeria } = req.params;

      const resultado = await feriaService.finalizarFeria(idFeria);

      return res.success(
        "Feria finalizada exitosamente. Ganadores calculados.",
        resultado
      );
    } catch (error) {
      console.error("Error al finalizar feria:", error);

      if (error.message === "Feria no encontrada") {
        return res.notFound("Feria");
      }

      if (error.message === "La feria ya está finalizada") {
        return res.error("La feria ya está finalizada", 400, {
          code: "ALREADY_FINALIZED",
          details: error.message,
        });
      }

      return res.error("Error al finalizar la feria", 500, {
        code: "FINALIZE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = feriaController;
