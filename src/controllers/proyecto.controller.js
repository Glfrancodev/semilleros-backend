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
        return res.status(400).json({
          error:
            "Los campos nombre, descripcion, contenido, idGrupoMateria e idConvocatoria son requeridos",
        });
      }

      const proyecto = await proyectoService.crearProyecto(req.body);

      return res.status(201).json({
        mensaje: "Proyecto creado exitosamente",
        proyecto,
      });
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      return res.status(500).json({
        error: error.message || "Error al crear el proyecto",
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

      return res.status(200).json({
        mensaje: "Proyectos obtenidos exitosamente",
        cantidad: proyectos.length,
        proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener los proyectos",
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

      return res.status(200).json({
        mensaje: "Proyecto obtenido exitosamente",
        proyecto,
      });
    } catch (error) {
      console.error("Error al obtener proyecto:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al obtener el proyecto",
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

      return res.status(200).json({
        mensaje: "Proyecto actualizado exitosamente",
        proyecto,
      });
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al actualizar el proyecto",
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

      return res.status(200).json(resultado);
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Error al eliminar el proyecto",
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

      return res.status(200).json({
        mensaje: "Proyectos obtenidos exitosamente",
        cantidad: proyectos.length,
        proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos por convocatoria:", error);
      return res.status(500).json({
        error: error.message || "Error al obtener los proyectos",
      });
    }
  },
};

module.exports = proyectoController;
