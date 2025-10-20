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
        return res.status(400).json({
          error: "Los campos nombre, semestre y año son requeridos",
        });
      }

      const convocatoria = await convocatoriaService.crearConvocatoria(
        req.body
      );

      return res.status(201).json({
        mensaje: "Convocatoria creada exitosamente",
        convocatoria,
      });
    } catch (error) {
      console.error("Error al crear convocatoria:", error);
      return res.status(500).json({
        error: error.message || "Error al crear la convocatoria",
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

      return res.status(200).json({
        mensaje: "Convocatorias obtenidas exitosamente",
        cantidad: convocatorias.length,
        convocatorias,
      });
    } catch (error) {
      console.error("Error al obtener convocatorias:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las convocatorias",
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

      return res.status(200).json({
        mensaje: "Convocatoria obtenida exitosamente",
        convocatoria,
      });
    } catch (error) {
      console.error("Error al obtener convocatoria:", error);

      if (error.message === "Convocatoria no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al obtener la convocatoria",
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

      return res.status(200).json({
        mensaje: "Convocatoria actualizada exitosamente",
        convocatoria,
      });
    } catch (error) {
      console.error("Error al actualizar convocatoria:", error);

      if (error.message === "Convocatoria no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al actualizar la convocatoria",
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

      const resultado = await convocatoriaService.eliminarConvocatoria(
        idConvocatoria
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al eliminar convocatoria:", error);

      if (error.message === "Convocatoria no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al eliminar la convocatoria",
      });
    }
  },
};

module.exports = convocatoriaController;
