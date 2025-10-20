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
        return res.validationError("El campo nombre es requerido");
      }

      const area = await areaService.crearArea(req.body);
      return res.success("Área creada exitosamente", area, 201);
    } catch (error) {
      console.error("Error al crear área:", error);
      return res.error("Error al crear el área", 500, {
        code: "CREATE_ERROR",
        details: error.message,
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
      return res.success("Áreas obtenidas exitosamente", {
        count: areas.length,
        items: areas,
      });
    } catch (error) {
      console.error("Error al obtener áreas:", error);
      return res.error("Error al obtener las áreas", 500, {
        code: "FETCH_ERROR",
        details: error.message,
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
      return res.success("Área obtenida exitosamente", area);
    } catch (error) {
      console.error("Error al obtener área:", error);

      if (error.message === "Área no encontrada") {
        return res.notFound("Área");
      }

      return res.error("Error al obtener el área", 500, {
        code: "FETCH_ERROR",
        details: error.message,
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
      return res.success("Área actualizada exitosamente", area);
    } catch (error) {
      console.error("Error al actualizar área:", error);

      if (error.message === "Área no encontrada") {
        return res.notFound("Área");
      }

      return res.error("Error al actualizar el área", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
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
      return res.success("Área eliminada exitosamente", { idArea });
    } catch (error) {
      console.error("Error al eliminar área:", error);

      if (error.message === "Área no encontrada") {
        return res.notFound("Área");
      }

      return res.error("Error al eliminar el área", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = areaController;
