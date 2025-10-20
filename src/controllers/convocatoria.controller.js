const convocatoriaService = require("../services/convocatoria.service");

const convocatoriaController = {
  /**
   * POST /api/convocatorias
   * Crear una nueva convocatoria
   */
  async crearConvocatoria(req, res) {
    try {
      const { nombre, semestre, año } = req.body;

      if (!nombre || !semestre || !año) {
        return res.validationError(
          "Los campos nombre, semestre y año son requeridos"
        );
      }

      const convocatoria = await convocatoriaService.crearConvocatoria(
        req.body
      );

      return res.success("Convocatoria creada exitosamente", convocatoria, 201);
    } catch (error) {
      console.error("Error al crear convocatoria:", error);
      return res.error("Error al crear la convocatoria", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/convocatorias
   * Obtener todas las convocatorias
   */
  async obtenerConvocatorias(req, res) {
    try {
      const convocatorias = await convocatoriaService.obtenerConvocatorias();

      return res.success("Convocatorias obtenidas exitosamente", {
        count: convocatorias.length,
        items: convocatorias,
      });
    } catch (error) {
      console.error("Error al obtener convocatorias:", error);
      return res.error("Error al obtener las convocatorias", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/convocatorias/:idConvocatoria
   * Obtener una convocatoria por ID
   */
  async obtenerConvocatoriaPorId(req, res) {
    try {
      const { idConvocatoria } = req.params;

      const convocatoria = await convocatoriaService.obtenerConvocatoriaPorId(
        idConvocatoria
      );

      return res.success("Convocatoria obtenida exitosamente", convocatoria);
    } catch (error) {
      console.error("Error al obtener convocatoria:", error);

      if (error.message === "Convocatoria no encontrada") {
        return res.notFound("Convocatoria");
      }

      return res.error("Error al obtener la convocatoria", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/convocatorias/:idConvocatoria
   * Actualizar una convocatoria
   */
  async actualizarConvocatoria(req, res) {
    try {
      const { idConvocatoria } = req.params;

      const convocatoria = await convocatoriaService.actualizarConvocatoria(
        idConvocatoria,
        req.body
      );

      return res.success("Convocatoria actualizada exitosamente", convocatoria);
    } catch (error) {
      console.error("Error al actualizar convocatoria:", error);

      if (error.message === "Convocatoria no encontrada") {
        return res.notFound("Convocatoria");
      }

      return res.error("Error al actualizar la convocatoria", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/convocatorias/:idConvocatoria
   * Eliminar una convocatoria
   */
  async eliminarConvocatoria(req, res) {
    try {
      const { idConvocatoria } = req.params;

      await convocatoriaService.eliminarConvocatoria(idConvocatoria);

      return res.success("Convocatoria eliminada exitosamente", null);
    } catch (error) {
      console.error("Error al eliminar convocatoria:", error);

      if (error.message === "Convocatoria no encontrada") {
        return res.notFound("Convocatoria");
      }

      return res.error("Error al eliminar la convocatoria", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = convocatoriaController;
