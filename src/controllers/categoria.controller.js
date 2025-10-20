const categoriaService = require('../services/categoria.service');

const categoriaController = {
  /**
   * POST /api/categorias
   * Crear una nueva categoría
   */
  async crearCategoria(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const categoria = await categoriaService.crearCategoria(req.body);

      return res.status(201).json({
        mensaje: 'Categoría creada exitosamente',
        categoria,
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return res.status(500).json({
        error: error.message || 'Error al crear la categoría',
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

      return res.status(200).json({
        mensaje: 'Categorías obtenidas exitosamente',
        cantidad: categorias.length,
        categorias,
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener las categorías',
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

      const categoria = await categoriaService.obtenerCategoriaPorId(idCategoria);

      return res.status(200).json({
        mensaje: 'Categoría obtenida exitosamente',
        categoria,
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);

      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al obtener la categoría',
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

      const categoria = await categoriaService.actualizarCategoria(idCategoria, req.body);

      return res.status(200).json({
        mensaje: 'Categoría actualizada exitosamente',
        categoria,
      });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);

      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al actualizar la categoría',
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

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);

      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al eliminar la categoría',
      });
    }
  },
};

module.exports = categoriaController;
