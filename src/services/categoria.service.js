const db = require('../models');
const Categoria = db.Categoria;
const Proyecto = db.Proyecto;

const categoriaService = {
  /**
   * Crear una nueva categoría
   */
  async crearCategoria(data) {
    try {
      const categoria = await Categoria.create({
        nombre: data.nombre,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return categoria;
    } catch (error) {
      console.error('Error en crearCategoria:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las categorías
   */
  async obtenerCategorias() {
    try {
      const categorias = await Categoria.findAll({
        order: [['nombre', 'ASC']],
      });

      return categorias;
    } catch (error) {
      console.error('Error en obtenerCategorias:', error);
      throw error;
    }
  },

  /**
   * Obtener una categoría por ID
   */
  async obtenerCategoriaPorId(idCategoria) {
    try {
      const categoria = await Categoria.findByPk(idCategoria, {
        include: [
          {
            model: Proyecto,
            as: 'proyectos',
            attributes: ['idProyecto', 'nombre'],
          },
        ],
      });

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      return categoria;
    } catch (error) {
      console.error('Error en obtenerCategoriaPorId:', error);
      throw error;
    }
  },

  /**
   * Actualizar una categoría
   */
  async actualizarCategoria(idCategoria, data) {
    try {
      const categoria = await Categoria.findByPk(idCategoria);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      await categoria.update({
        nombre: data.nombre || categoria.nombre,
        fechaActualizacion: new Date(),
      });

      return categoria;
    } catch (error) {
      console.error('Error en actualizarCategoria:', error);
      throw error;
    }
  },

  /**
   * Eliminar una categoría
   */
  async eliminarCategoria(idCategoria) {
    try {
      const categoria = await Categoria.findByPk(idCategoria);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      await categoria.destroy();

      return { mensaje: 'Categoría eliminada exitosamente' };
    } catch (error) {
      console.error('Error en eliminarCategoria:', error);
      throw error;
    }
  },
};

module.exports = categoriaService;
