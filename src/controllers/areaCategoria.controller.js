const areaCategoriaService = require("../services/areaCategoria.service");

const areaCategoriaController = {
  /**
   * POST /api/area-categorias
   * Crear una nueva área-categoría
   */
  async crearAreaCategoria(req, res) {
    try {
      const { idArea, idCategoria } = req.body;

      if (!idArea || !idCategoria) {
        return res.status(400).json({
          error: "Los campos idArea e idCategoria son requeridos",
        });
      }

      const areaCategoria = await areaCategoriaService.crearAreaCategoria(
        req.body
      );

      return res.status(201).json({
        mensaje: "AreaCategoría creada exitosamente",
        areaCategoria,
      });
    } catch (error) {
      console.error("Error al crear área-categoría:", error);
      return res.status(500).json({
        error: error.message || "Error al crear la área-categoría",
      });
    }
  },

  /**
   * GET /api/area-categorias
   * Obtener todas las áreas-categorías
   */
  async obtenerAreaCategorias(req, res) {
    try {
      const areaCategorias = await areaCategoriaService.obtenerAreaCategorias();

      return res.status(200).json({
        mensaje: "AreaCategorías obtenidas exitosamente",
        cantidad: areaCategorias.length,
        areaCategorias,
      });
    } catch (error) {
      console.error("Error al obtener áreas-categorías:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las áreas-categorías",
      });
    }
  },

  /**
   * GET /api/area-categorias/:idAreaCategoria
   * Obtener un área-categoría por ID
   */
  async obtenerAreaCategoriaPorId(req, res) {
    try {
      const { idAreaCategoria } = req.params;

      const areaCategoria =
        await areaCategoriaService.obtenerAreaCategoriaPorId(idAreaCategoria);

      return res.status(200).json({
        mensaje: "AreaCategoría obtenida exitosamente",
        areaCategoria,
      });
    } catch (error) {
      console.error("Error al obtener área-categoría:", error);

      if (error.message === "AreaCategoría no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al obtener la área-categoría",
      });
    }
  },

  /**
   * GET /api/area-categorias/area/:idArea
   * Obtener áreas-categorías por área
   */
  async obtenerAreaCategoriasPorArea(req, res) {
    try {
      const { idArea } = req.params;

      const areaCategorias =
        await areaCategoriaService.obtenerAreaCategoriasPorArea(idArea);

      return res.status(200).json({
        mensaje: "AreaCategorías obtenidas exitosamente",
        cantidad: areaCategorias.length,
        areaCategorias,
      });
    } catch (error) {
      console.error("Error al obtener áreas-categorías:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las áreas-categorías",
      });
    }
  },

  /**
   * GET /api/area-categorias/categoria/:idCategoria
   * Obtener áreas-categorías por categoría
   */
  async obtenerAreaCategoriasPorCategoria(req, res) {
    try {
      const { idCategoria } = req.params;

      const areaCategorias =
        await areaCategoriaService.obtenerAreaCategoriasPorCategoria(
          idCategoria
        );

      return res.status(200).json({
        mensaje: "AreaCategorías obtenidas exitosamente",
        cantidad: areaCategorias.length,
        areaCategorias,
      });
    } catch (error) {
      console.error("Error al obtener áreas-categorías:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener las áreas-categorías",
      });
    }
  },

  /**
   * PUT /api/area-categorias/:idAreaCategoria
   * Actualizar un área-categoría
   */
  async actualizarAreaCategoria(req, res) {
    try {
      const { idAreaCategoria } = req.params;

      const areaCategoria = await areaCategoriaService.actualizarAreaCategoria(
        idAreaCategoria,
        req.body
      );

      return res.status(200).json({
        mensaje: "AreaCategoría actualizada exitosamente",
        areaCategoria,
      });
    } catch (error) {
      console.error("Error al actualizar área-categoría:", error);

      if (error.message === "AreaCategoría no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al actualizar la área-categoría",
      });
    }
  },

  /**
   * DELETE /api/area-categorias/:idAreaCategoria
   * Eliminar un área-categoría
   */
  async eliminarAreaCategoria(req, res) {
    try {
      const { idAreaCategoria } = req.params;

      const resultado = await areaCategoriaService.eliminarAreaCategoria(
        idAreaCategoria
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al eliminar área-categoría:", error);

      if (error.message === "AreaCategoría no encontrada") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al eliminar la área-categoría",
      });
    }
  },
};

module.exports = areaCategoriaController;
