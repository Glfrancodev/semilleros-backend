const db = require("../models");
const AreaCategoria = db.AreaCategoria;
const Area = db.Area;
const Categoria = db.Categoria;
const Materia = db.Materia;
const Administrativo = db.Administrativo;
const Usuario = db.Usuario;

const areaCategoriaService = {
  /**
   * Crear una nueva área-categoría
   */
  async crearAreaCategoria(data) {
    const transaction = await db.sequelize.transaction();
    try {
      const areaCategoria = await AreaCategoria.create(
        {
          idArea: data.idArea,
          idCategoria: data.idCategoria,
          creadoPor: data.creadoPor,
          actualizadoPor: data.actualizadoPor,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      await transaction.commit();
      return areaCategoria;
    } catch (error) {
      await transaction.rollback();
      console.error("Error en crearAreaCategoria:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las áreas-categorías
   */
  async obtenerAreaCategorias() {
    try {
      const areaCategorias = await AreaCategoria.findAll({
        include: [
          {
            model: Area,
            as: "area",
          },
          {
            model: Categoria,
            as: "categoria",
          },
          {
            model: Materia,
            as: "materias",
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return areaCategorias;
    } catch (error) {
      console.error("Error en obtenerAreaCategorias:", error);
      throw error;
    }
  },

  /**
   * Obtener un área-categoría por ID
   */
  async obtenerAreaCategoriaPorId(idAreaCategoria) {
    try {
      const areaCategoria = await AreaCategoria.findByPk(idAreaCategoria, {
        include: [
          {
            model: Area,
            as: "area",
          },
          {
            model: Categoria,
            as: "categoria",
          },
          {
            model: Materia,
            as: "materias",
          },
        ],
      });

      if (!areaCategoria) {
        throw new Error("AreaCategoría no encontrada");
      }

      return areaCategoria;
    } catch (error) {
      console.error("Error en obtenerAreaCategoriaPorId:", error);
      throw error;
    }
  },

  /**
   * Obtener áreas-categorías por área
   */
  async obtenerAreaCategoriasPorArea(idArea) {
    try {
      const areaCategorias = await AreaCategoria.findAll({
        where: { idArea },
        include: [
          {
            model: Area,
            as: "area",
          },
          {
            model: Categoria,
            as: "categoria",
          },
          {
            model: Materia,
            as: "materias",
          },
        ],
      });

      return areaCategorias;
    } catch (error) {
      console.error("Error en obtenerAreaCategoriasPorArea:", error);
      throw error;
    }
  },

  /**
   * Obtener áreas-categorías por categoría
   */
  async obtenerAreaCategoriasPorCategoria(idCategoria) {
    try {
      const areaCategorias = await AreaCategoria.findAll({
        where: { idCategoria },
        include: [
          {
            model: Area,
            as: "area",
          },
          {
            model: Categoria,
            as: "categoria",
          },
          {
            model: Materia,
            as: "materias",
          },
        ],
      });

      return areaCategorias;
    } catch (error) {
      console.error("Error en obtenerAreaCategoriasPorCategoria:", error);
      throw error;
    }
  },

  /**
   * Actualizar un área-categoría
   */
  async actualizarAreaCategoria(idAreaCategoria, data) {
    const transaction = await db.sequelize.transaction();
    try {
      const areaCategoria = await AreaCategoria.findByPk(idAreaCategoria);

      if (!areaCategoria) {
        throw new Error("AreaCategoría no encontrada");
      }

      await areaCategoria.update(
        {
          idArea: data.idArea || areaCategoria.idArea,
          idCategoria: data.idCategoria || areaCategoria.idCategoria,
          actualizadoPor: data.actualizadoPor || areaCategoria.actualizadoPor,
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      await transaction.commit();
      return areaCategoria;
    } catch (error) {
      await transaction.rollback();
      console.error("Error en actualizarAreaCategoria:", error);
      throw error;
    }
  },

  /**
   * Eliminar un área-categoría
   */
  async eliminarAreaCategoria(idAreaCategoria) {
    try {
      const areaCategoria = await AreaCategoria.findByPk(idAreaCategoria);

      if (!areaCategoria) {
        throw new Error("AreaCategoría no encontrada");
      }

      await areaCategoria.destroy();

      return { mensaje: "AreaCategoría eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarAreaCategoria:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las materias de un AreaCategoria
   */
  async obtenerMateriasPorAreaCategoria(idAreaCategoria) {
    try {
      const areaCategoria = await AreaCategoria.findByPk(idAreaCategoria);

      if (!areaCategoria) {
        throw new Error("AreaCategoria no encontrada");
      }

      const materias = await Materia.findAll({
        where: { idAreaCategoria },
        attributes: ["idMateria", "nombre", "sigla"],
        order: [["nombre", "ASC"]],
      });

      return materias;
    } catch (error) {
      console.error("Error en obtenerMateriasPorAreaCategoria:", error);
      throw error;
    }
  },

  /**
   * Buscar AreaCategoria por idArea e idCategoria
   */
  async buscarAreaCategoriaPorAreaYCategoria(idArea, idCategoria) {
    try {
      const areaCategoria = await AreaCategoria.findOne({
        where: { idArea, idCategoria },
        include: [
          {
            model: Area,
            as: "area",
          },
          {
            model: Categoria,
            as: "categoria",
          },
        ],
      });

      if (!areaCategoria) {
        throw new Error("AreaCategoria no encontrada");
      }

      return areaCategoria;
    } catch (error) {
      console.error("Error en buscarAreaCategoriaPorAreaYCategoria:", error);
      throw error;
    }
  },
};

module.exports = areaCategoriaService;
