const areaService = require("../services/area.service");

const areaController = {
  /**
   * POST /api/areas
   * Crear una nueva área
   */
  async crearArea(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({
          error: "El campo nombre es requerido",
        });
      }

      const area = await areaService.crearArea(req.body);

      return res.status(201).json({
        mensaje: "Área creada exitosamente",
        area,
      });
    } catch (error) {
      console.error("Error al crear área:", error);
      return res.status(500).json({
        error: error.message || "Error al crear el área",
      });
    }
  },

  /**
   * GET /api/areas
   * Obtener todas las áreas
   */
  async obtenerAreas(req, res) {
    try {
      const areas = await areaService.obtenerAreas();

      return res.status(200).json({
        mensaje: "Áreas obtenidas exitosamente",
        cantidad: areas.length,
        areas,
      });
    } catch (error) {
      console.error("Error al obtener áreas:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las áreas",
      });
    }
  },

  /**
   * GET /api/areas/:idArea
   * Obtener un área por ID
   */
  async obtenerAreaPorId(req, res) {
    try {
      const { idArea } = req.params;

      const area = await areaService.obtenerAreaPorId(idArea);

      return res.status(200).json({
        mensaje: "Área obtenida exitosamente",
        area,
      });
    } catch (error) {
      console.error("Error al obtener área:", error);

      if (error.message === "Área no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al obtener el área",
      });
    }
  },

  /**
   * PUT /api/areas/:idArea
   * Actualizar un área
   */
  async actualizarArea(req, res) {
    try {
      const { idArea } = req.params;

      const area = await areaService.actualizarArea(idArea, req.body);

      return res.status(200).json({
        mensaje: "Área actualizada exitosamente",
        area,
      });
    } catch (error) {
      console.error("Error al actualizar área:", error);

      if (error.message === "Área no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al actualizar el área",
      });
    }
  },

  /**
   * DELETE /api/areas/:idArea
   * Eliminar un área
   */
  async eliminarArea(req, res) {
    try {
      const { idArea } = req.params;

      const resultado = await areaService.eliminarArea(idArea);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al eliminar área:", error);

      if (error.message === "Área no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al eliminar el área",
      });
    }
  },
};

module.exports = areaController;
