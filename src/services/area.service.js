const db = require("../models");
const Area = db.Area;
const AreaCategoria = db.AreaCategoria;
const Administrativo = db.Administrativo;
const Usuario = db.Usuario;

const areaService = {
  /**
   * Crear una nueva área
   */
  async crearArea(data) {
    const transaction = await db.sequelize.transaction();
    try {
      const area = await Area.create(
        {
          nombre: data.nombre,
          creadoPor: data.creadoPor,
          actualizadoPor: data.actualizadoPor,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      const areaCompleta = await Area.findByPk(area.idArea, {
        include: [
          {
            model: Administrativo,
            as: "creador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "actualizador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
        ],
      });

      return areaCompleta;
    } catch (error) {
      await transaction.rollback();
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
            include: [
              {
                model: db.Categoria,
                as: "categoria",
                attributes: ["idCategoria", "nombre"],
              },
              {
                model: db.Materia,
                as: "materias",
                attributes: ["idMateria", "nombre"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "creador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "actualizador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
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
            include: [
              {
                model: db.Categoria,
                as: "categoria",
                attributes: ["idCategoria", "nombre"],
              },
              {
                model: db.Materia,
                as: "materias",
                attributes: ["idMateria", "nombre"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "creador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "actualizador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
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
    const transaction = await db.sequelize.transaction();
    try {
      const area = await Area.findByPk(idArea);

      if (!area) {
        throw new Error("Área no encontrada");
      }

      await area.update(
        {
          nombre: data.nombre || area.nombre,
          actualizadoPor: data.actualizadoPor || area.actualizadoPor,
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      const areaActualizada = await Area.findByPk(idArea, {
        include: [
          {
            model: Administrativo,
            as: "creador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "actualizador",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
        ],
      });

      return areaActualizada;
    } catch (error) {
      await transaction.rollback();
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
