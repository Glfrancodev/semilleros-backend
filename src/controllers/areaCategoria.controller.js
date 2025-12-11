const areaCategoriaService = require("../services/areaCategoria.service");
const { Usuario, Administrativo } = require("../models");

const areaCategoriaController = {
  /**
   * POST /api/area-categorias
   * Crear una nueva área-categoría
   */
  async crearAreaCategoria(req, res) {
    try {
      const { idArea, idCategoria } = req.body;

      if (!idArea || !idCategoria) {
        return res.validationError(
          "Los campos idArea e idCategoria son requeridos"
        );
      }

      // Obtener idAdministrativo del usuario autenticado
      const usuario = await Usuario.findByPk(req.user.idUsuario, {
        include: [{ model: Administrativo, as: "Administrativo" }],
      });
      const idAdministrativo = usuario?.Administrativo?.idAdministrativo;

      const areaCategoria = await areaCategoriaService.crearAreaCategoria({
        ...req.body,
        creadoPor: idAdministrativo,
        actualizadoPor: idAdministrativo,
      });
      return res.success(
        "AreaCategoría creada exitosamente",
        areaCategoria,
        201
      );
    } catch (error) {
      console.error("Error al crear área-categoría:", error);
      return res.error("Error al crear la área-categoría", 500, {
        code: "CREATE_ERROR",
        details: error.message,
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
      return res.success("AreaCategorías obtenidas exitosamente", {
        count: areaCategorias.length,
        items: areaCategorias,
      });
    } catch (error) {
      console.error("Error al obtener áreas-categorías:", error);
      return res.error("Error al obtener las áreas-categorías", 500, {
        code: "FETCH_ERROR",
        details: error.message,
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
      return res.success("AreaCategoría obtenida exitosamente", areaCategoria);
    } catch (error) {
      console.error("Error al obtener área-categoría:", error);

      if (error.message === "AreaCategoría no encontrada") {
        return res.notFound("AreaCategoría");
      }

      return res.error("Error al obtener la área-categoría", 500, {
        code: "FETCH_ERROR",
        details: error.message,
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
      return res.success("AreaCategorías obtenidas exitosamente", {
        count: areaCategorias.length,
        items: areaCategorias,
      });
    } catch (error) {
      console.error("Error al obtener áreas-categorías:", error);
      return res.error("Error al obtener las áreas-categorías", 500, {
        code: "FETCH_ERROR",
        details: error.message,
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
      return res.success("AreaCategorías obtenidas exitosamente", {
        count: areaCategorias.length,
        items: areaCategorias,
      });
    } catch (error) {
      console.error("Error al obtener áreas-categorías:", error);
      return res.error("Error al obtener las áreas-categorías", 500, {
        code: "FETCH_ERROR",
        details: error.message,
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

      // Obtener idAdministrativo del usuario autenticado
      const usuario = await Usuario.findByPk(req.user.idUsuario, {
        include: [{ model: Administrativo, as: "Administrativo" }],
      });
      const idAdministrativo = usuario?.Administrativo?.idAdministrativo;

      const areaCategoria = await areaCategoriaService.actualizarAreaCategoria(
        idAreaCategoria,
        {
          ...req.body,
          actualizadoPor: idAdministrativo,
        }
      );
      return res.success(
        "AreaCategoría actualizada exitosamente",
        areaCategoria
      );
    } catch (error) {
      console.error("Error al actualizar área-categoría:", error);

      if (error.message === "AreaCategoría no encontrada") {
        return res.notFound("AreaCategoría");
      }

      return res.error("Error al actualizar la área-categoría", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
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
      return res.success("AreaCategoría eliminada exitosamente", {
        idAreaCategoria,
      });
    } catch (error) {
      console.error("Error al eliminar área-categoría:", error);

      if (error.message === "AreaCategoría no encontrada") {
        return res.notFound("AreaCategoría");
      }

      return res.error("Error al eliminar la área-categoría", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/area-categorias/:idAreaCategoria/materias
   * Obtener todas las materias de un área-categoría
   */
  async obtenerMateriasPorAreaCategoria(req, res) {
    try {
      const { idAreaCategoria } = req.params;
      const materias =
        await areaCategoriaService.obtenerMateriasPorAreaCategoria(
          idAreaCategoria
        );
      return res.success("Materias obtenidas exitosamente", {
        count: materias.length,
        items: materias,
      });
    } catch (error) {
      console.error("Error al obtener materias por área-categoría:", error);

      if (error.message === "AreaCategoria no encontrada") {
        return res.notFound("AreaCategoria");
      }

      return res.error("Error al obtener las materias", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/area-categorias/buscar?idArea=xxx&idCategoria=yyy
   * Buscar área-categoría por idArea e idCategoria
   */
  async buscarAreaCategoriaPorAreaYCategoria(req, res) {
    try {
      const { idArea, idCategoria } = req.query;

      if (!idArea || !idCategoria) {
        return res.validationError(
          "Los parámetros idArea e idCategoria son requeridos"
        );
      }

      const areaCategoria =
        await areaCategoriaService.buscarAreaCategoriaPorAreaYCategoria(
          idArea,
          idCategoria
        );
      return res.success(
        "AreaCategoria encontrada exitosamente",
        areaCategoria
      );
    } catch (error) {
      console.error("Error al buscar área-categoría:", error);

      if (error.message === "AreaCategoria no encontrada") {
        return res.notFound("AreaCategoria");
      }

      return res.error("Error al buscar la área-categoría", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = areaCategoriaController;
