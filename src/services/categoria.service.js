const db = require("../models");
const Categoria = db.Categoria;
const Proyecto = db.Proyecto;
const Administrativo = db.Administrativo;
const Usuario = db.Usuario;

const categoriaService = {
  /**
   * Crear una nueva categoría
   */
  async crearCategoria(data) {
    const transaction = await db.sequelize.transaction();
    try {
      const categoria = await Categoria.create(
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

      const categoriaCompleta = await Categoria.findByPk(
        categoria.idCategoria,
        {
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
        }
      );

      return categoriaCompleta;
    } catch (error) {
      await transaction.rollback();
      console.error("Error en crearCategoria:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las categorías
   */
  async obtenerCategorias() {
    try {
      const categorias = await Categoria.findAll({
        order: [["nombre", "ASC"]],
        include: [
          {
            model: db.AreaCategoria,
            as: "areaCategorias",
            include: [
              {
                model: db.Materia,
                as: "materias",
                attributes: ["idMateria", "sigla", "nombre"],
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

      return categorias;
    } catch (error) {
      console.error("Error en obtenerCategorias:", error);
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
            as: "proyectos",
            attributes: ["idProyecto", "nombre"],
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

      if (!categoria) {
        throw new Error("Categoría no encontrada");
      }

      return categoria;
    } catch (error) {
      console.error("Error en obtenerCategoriaPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar una categoría
   */
  async actualizarCategoria(idCategoria, data) {
    const transaction = await db.sequelize.transaction();
    try {
      const categoria = await Categoria.findByPk(idCategoria);

      if (!categoria) {
        throw new Error("Categoría no encontrada");
      }

      await categoria.update(
        {
          nombre: data.nombre || categoria.nombre,
          actualizadoPor: data.actualizadoPor || categoria.actualizadoPor,
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      const categoriaActualizada = await Categoria.findByPk(idCategoria, {
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

      return categoriaActualizada;
    } catch (error) {
      await transaction.rollback();
      console.error("Error en actualizarCategoria:", error);
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
        throw new Error("Categoría no encontrada");
      }

      await categoria.destroy();

      return { mensaje: "Categoría eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarCategoria:", error);
      throw error;
    }
  },
};

module.exports = categoriaService;
