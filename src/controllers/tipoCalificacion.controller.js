const tipoCalificacionService = require("../services/tipoCalificacion.service");

const tipoCalificacionController = {
  /**
   * POST /api/tipos-calificacion
   * Crear un nuevo tipo de calificación
   */
  async crearTipoCalificacion(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.validationError("El campo nombre es requerido");
      }

      const tipo = await tipoCalificacionService.crearTipoCalificacion(
        req.body
      );
      return res.success("Tipo de calificación creado exitosamente", tipo, 201);
    } catch (error) {
      console.error("Error al crear tipo de calificación:", error);
      return res.error("Error al crear el tipo de calificación", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tipos-calificacion
   * Obtener todos los tipos de calificación
   */
  async obtenerTiposCalificacion(req, res) {
    try {
      const tipos = await tipoCalificacionService.obtenerTiposCalificacion();
      return res.success("Tipos de calificación obtenidos exitosamente", {
        count: tipos.length,
        items: tipos,
      });
    } catch (error) {
      console.error("Error al obtener tipos de calificación:", error);
      return res.error("Error al obtener los tipos de calificación", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/tipos-calificacion/:idTipoCalificacion
   * Obtener un tipo de calificación por ID
   */
  async obtenerTipoCalificacionPorId(req, res) {
    try {
      const { idTipoCalificacion } = req.params;
      const tipo = await tipoCalificacionService.obtenerTipoCalificacionPorId(
        idTipoCalificacion
      );
      return res.success("Tipo de calificación obtenido exitosamente", tipo);
    } catch (error) {
      console.error("Error al obtener tipo de calificación:", error);

      if (error.message === "Tipo de calificación no encontrado") {
        return res.notFound("Tipo de calificación");
      }

      return res.error("Error al obtener el tipo de calificación", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/tipos-calificacion/:idTipoCalificacion
   * Actualizar un tipo de calificación
   */
  async actualizarTipoCalificacion(req, res) {
    try {
      const { idTipoCalificacion } = req.params;
      const tipo = await tipoCalificacionService.actualizarTipoCalificacion(
        idTipoCalificacion,
        req.body
      );
      return res.success("Tipo de calificación actualizado exitosamente", tipo);
    } catch (error) {
      console.error("Error al actualizar tipo de calificación:", error);

      if (error.message === "Tipo de calificación no encontrado") {
        return res.notFound("Tipo de calificación");
      }

      return res.error("Error al actualizar el tipo de calificación", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/tipos-calificacion/:idTipoCalificacion
   * Eliminar un tipo de calificación
   */
  async eliminarTipoCalificacion(req, res) {
    try {
      const { idTipoCalificacion } = req.params;
      const resultado = await tipoCalificacionService.eliminarTipoCalificacion(
        idTipoCalificacion
      );
      return res.success("Tipo de calificación eliminado exitosamente", {
        idTipoCalificacion,
      });
    } catch (error) {
      console.error("Error al eliminar tipo de calificación:", error);

      if (error.message === "Tipo de calificación no encontrado") {
        return res.notFound("Tipo de calificación");
      }

      return res.error("Error al eliminar el tipo de calificación", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = tipoCalificacionController;
