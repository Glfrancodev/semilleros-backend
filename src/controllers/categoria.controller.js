const categoriaService = require("../services/categoria.service");

const categoriaController = {
  /**
   * POST /api/categorias
   * Crear una nueva categoría
   */
  async crearCategoria(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.validationError("El campo nombre es requerido");
      }

      const categoria = await categoriaService.crearCategoria(req.body);
      return res.success("Categoría creada exitosamente", categoria, 201);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      return res.error("Error al crear la categoría", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/categorias
   * Obtener todas las categorías
   */
  async obtenerCategorias(req, res) {
    try {
      const categorias = await categoriaService.obtenerCategorias();
      return res.success("Categorías obtenidas exitosamente", {
        count: categorias.length,
        items: categorias,
      });
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return res.error("Error al obtener las categorías", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/categorias/:idCategoria
   * Obtener una categoría por ID
   */
  async obtenerCategoriaPorId(req, res) {
    try {
      const { idCategoria } = req.params;
      const categoria = await categoriaService.obtenerCategoriaPorId(
        idCategoria
      );
      return res.success("Categoría obtenida exitosamente", categoria);
    } catch (error) {
      console.error("Error al obtener categoría:", error);

      if (error.message === "Categoría no encontrada") {
        return res.notFound("Categoría");
      }

      return res.error("Error al obtener la categoría", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/categorias/:idCategoria
   * Actualizar una categoría
   */
  async actualizarCategoria(req, res) {
    try {
      const { idCategoria } = req.params;
      const categoria = await categoriaService.actualizarCategoria(
        idCategoria,
        req.body
      );
      return res.success("Categoría actualizada exitosamente", categoria);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);

      if (error.message === "Categoría no encontrada") {
        return res.notFound("Categoría");
      }

      return res.error("Error al actualizar la categoría", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/categorias/:idCategoria
   * Eliminar una categoría
   */
  async eliminarCategoria(req, res) {
    try {
      const { idCategoria } = req.params;
      const resultado = await categoriaService.eliminarCategoria(idCategoria);
      return res.success("Categoría eliminada exitosamente", { idCategoria });
    } catch (error) {
      console.error("Error al eliminar categoría:", error);

      if (error.message === "Categoría no encontrada") {
        return res.notFound("Categoría");
      }

      return res.error("Error al eliminar la categoría", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = categoriaController;
