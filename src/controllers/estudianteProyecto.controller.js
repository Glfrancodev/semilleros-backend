const estudianteProyectoService = require("../services/estudianteProyecto.service");

const estudianteProyectoController = {
  /**
   * POST /api/estudiante-proyectos
   * Asignar un estudiante a un proyecto
   */
  async asignarEstudianteAProyecto(req, res) {
    try {
      const { idEstudiante, idProyecto } = req.body;

      if (!idEstudiante || !idProyecto) {
        return res.validationError(
          "Los campos idEstudiante e idProyecto son requeridos"
        );
      }

      const asignacion =
        await estudianteProyectoService.asignarEstudianteAProyecto(req.body);
      return res.success(
        "Estudiante asignado al proyecto exitosamente",
        asignacion,
        201
      );
    } catch (error) {
      console.error("Error al asignar estudiante:", error);
      return res.error("Error al asignar estudiante al proyecto", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/estudiante-proyectos
   * Obtener todas las asignaciones
   */
  async obtenerAsignaciones(req, res) {
    try {
      const asignaciones =
        await estudianteProyectoService.obtenerAsignaciones();
      return res.success("Asignaciones obtenidas exitosamente", {
        count: asignaciones.length,
        items: asignaciones,
      });
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
      return res.error("Error al obtener las asignaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/estudiante-proyectos/proyecto/:idProyecto
   * Obtener estudiantes de un proyecto
   */
  async obtenerEstudiantesPorProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const estudiantes =
        await estudianteProyectoService.obtenerEstudiantesPorProyecto(
          idProyecto
        );
      return res.success("Estudiantes obtenidos exitosamente", {
        count: estudiantes.length,
        items: estudiantes,
      });
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      return res.error("Error al obtener los estudiantes del proyecto", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/estudiante-proyectos/estudiante/:idEstudiante
   * Obtener proyectos de un estudiante
   */
  async obtenerProyectosPorEstudiante(req, res) {
    try {
      const { idEstudiante } = req.params;
      const proyectos =
        await estudianteProyectoService.obtenerProyectosPorEstudiante(
          idEstudiante
        );
      return res.success("Proyectos obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      return res.error("Error al obtener los proyectos del estudiante", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/estudiante-proyectos/:idEstudianteProyecto
   * Actualizar asignación
   */
  async actualizarAsignacion(req, res) {
    try {
      const { idEstudianteProyecto } = req.params;
      const asignacion = await estudianteProyectoService.actualizarAsignacion(
        idEstudianteProyecto,
        req.body
      );
      return res.success("Asignación actualizada exitosamente", asignacion);
    } catch (error) {
      console.error("Error al actualizar asignación:", error);

      if (error.message === "Asignación no encontrada") {
        return res.notFound("Asignación");
      }

      return res.error("Error al actualizar la asignación", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/estudiante-proyectos/:idEstudianteProyecto
   * Eliminar asignación
   */
  async eliminarAsignacion(req, res) {
    try {
      const { idEstudianteProyecto } = req.params;
      const resultado = await estudianteProyectoService.eliminarAsignacion(
        idEstudianteProyecto
      );
      return res.success("Asignación eliminada exitosamente", {
        idEstudianteProyecto,
      });
    } catch (error) {
      console.error("Error al eliminar asignación:", error);

      if (error.message === "Asignación no encontrada") {
        return res.notFound("Asignación");
      }

      return res.error("Error al eliminar la asignación", 500, {
        code: "DELETE_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = estudianteProyectoController;
