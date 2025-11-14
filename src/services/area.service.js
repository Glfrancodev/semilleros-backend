const db = require("../models");
const Area = db.Area;
const AreaCategoria = db.AreaCategoria;

const areaService = {
  /**
   * Crear una nueva área
   */
  async crearArea(data) {
    try {
      const area = await Area.create({
        nombre: data.nombre,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return area;
    } catch (error) {
      console.error("Error en crearArea:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las áreas
   */
  async obtenerAreas() {
    try {
      const areas = await Area.findAll({
        include: [
          {
            model: AreaCategoria,
            as: "areaCategorias",
          },
        ],
        order: [["nombre", "ASC"]],
      });

      return areas;
    } catch (error) {
      console.error("Error en obtenerAreas:", error);
      throw error;
    }
  },

  /**
   * Obtener un área por ID
   */
  async obtenerAreaPorId(idArea) {
    try {
      const area = await Area.findByPk(idArea, {
        include: [
          {
            model: AreaCategoria,
            as: "areaCategorias",
          },
        ],
      });

      if (!area) {
        throw new Error("Área no encontrada");
      }

      return area;
    } catch (error) {
      console.error("Error en obtenerAreaPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar un área
   */
  async actualizarArea(idArea, data) {
    try {
      const area = await Area.findByPk(idArea);

      if (!area) {
        throw new Error("Área no encontrada");
      }

      await area.update({
        nombre: data.nombre || area.nombre,
        fechaActualizacion: new Date(),
      });

      return area;
    } catch (error) {
      console.error("Error en actualizarArea:", error);
      throw error;
    }
  },

  /**
   * Eliminar un área
   */
  async eliminarArea(idArea) {
    try {
      const area = await Area.findByPk(idArea);

      if (!area) {
        throw new Error("Área no encontrada");
      }

      await area.destroy();

      return { mensaje: "Área eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarArea:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las categorías disponibles para un área
   */
  async obtenerCategoriasPorArea(idArea) {
    try {
      const area = await Area.findByPk(idArea);

      if (!area) {
        throw new Error("Área no encontrada");
      }

      const areaCategorias = await AreaCategoria.findAll({
        where: { idArea },
        include: [
          {
            model: db.Categoria,
            as: "categoria",
            attributes: ["idCategoria", "nombre"],
          },
        ],
      });

      // Retornar solo las categorías con su idAreaCategoria
      return areaCategorias.map((ac) => ({
        idAreaCategoria: ac.idAreaCategoria,
        idCategoria: ac.categoria.idCategoria,
        nombre: ac.categoria.nombre,
      }));
    } catch (error) {
      console.error("Error en obtenerCategoriasPorArea:", error);
      throw error;
    }
  },
};

module.exports = areaService;
