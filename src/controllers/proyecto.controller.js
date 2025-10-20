const proyectoService = require("../services/proyecto.service");

const proyectoController = {
  /**
   * POST /api/proyectos
   * Crear un nuevo proyecto
   */
  async crearProyecto(req, res) {
    try {
      const { nombre, descripcion, contenido, idGrupoMateria, idConvocatoria } =
        req.body;

      if (
        !nombre ||
        !descripcion ||
        !contenido ||
        !idGrupoMateria ||
        !idConvocatoria
      ) {
        return res.validationError(
          "Los campos nombre, descripcion, contenido, idGrupoMateria e idConvocatoria son requeridos"
        );
      }

      const proyecto = await proyectoService.crearProyecto(req.body);
      return res.success("Proyecto creado exitosamente", proyecto, 201);
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      return res.error("Error al crear el proyecto", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos
   * Obtener todos los proyectos
   */
  async obtenerProyectos(req, res) {
    try {
      const proyectos = await proyectoService.obtenerProyectos();
      return res.success("Proyectos obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      return res.error("Error al obtener los proyectos", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/:idProyecto
   * Obtener un proyecto por ID
   */
  async obtenerProyectoPorId(req, res) {
    try {
      const { idProyecto } = req.params;
      const proyecto = await proyectoService.obtenerProyectoPorId(idProyecto);
      return res.success("Proyecto obtenido exitosamente", proyecto);
    } catch (error) {
      console.error("Error al obtener proyecto:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al obtener el proyecto", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/proyectos/:idProyecto
   * Actualizar un proyecto
   */
  async actualizarProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const proyecto = await proyectoService.actualizarProyecto(
        idProyecto,
        req.body
      );
      return res.success("Proyecto actualizado exitosamente", proyecto);
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al actualizar el proyecto", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/proyectos/:idProyecto
   * Eliminar un proyecto
   */
  async eliminarProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const resultado = await proyectoService.eliminarProyecto(idProyecto);
      return res.success("Proyecto eliminado exitosamente", { idProyecto });
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al eliminar el proyecto", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/convocatoria/:idConvocatoria
   * Obtener proyectos por convocatoria
   */
  async obtenerProyectosPorConvocatoria(req, res) {
    try {
      const { idConvocatoria } = req.params;
      const proyectos = await proyectoService.obtenerProyectosPorConvocatoria(
        idConvocatoria
      );
      return res.success("Proyectos obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos por convocatoria:", error);
      return res.error("Error al obtener los proyectos", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = proyectoController;
