const docenteProyectoService = require("../services/docenteProyecto.service");

const docenteProyectoController = {
  /**
   * POST /api/docente-proyectos
   * Asignar un docente a un proyecto
   */
  async asignarDocenteAProyecto(req, res) {
    try {
      const { idDocente, idProyecto } = req.body;

      if (!idDocente || !idProyecto) {
        return res.validationError(
          "Los campos idDocente e idProyecto son requeridos"
        );
      }

      const asignacion = await docenteProyectoService.asignarDocenteAProyecto(
        req.body
      );
      return res.success(
        "Docente asignado al proyecto exitosamente",
        asignacion,
        201
      );
    } catch (error) {
      console.error("Error al asignar docente:", error);
      return res.error("Error al asignar docente al proyecto", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/docente-proyectos
   * Obtener todas las asignaciones
   */
  async obtenerAsignaciones(req, res) {
    try {
      const asignaciones = await docenteProyectoService.obtenerAsignaciones();
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
   * GET /api/docente-proyectos/:idDocenteProyecto
   * Obtener una asignación por ID
   */
  async obtenerAsignacionPorId(req, res) {
    try {
      const { idDocenteProyecto } = req.params;
      const asignacion = await docenteProyectoService.obtenerAsignacionPorId(
        idDocenteProyecto
      );
      return res.success("Asignación obtenida exitosamente", asignacion);
    } catch (error) {
      console.error("Error al obtener asignación:", error);

      if (error.message === "Asignación no encontrada") {
        return res.notFound("Asignación");
      }

      return res.error("Error al obtener la asignación", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/docente-proyectos/proyecto/:idProyecto
   * Obtener docentes de un proyecto
   */
  async obtenerDocentesPorProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const docentes = await docenteProyectoService.obtenerDocentesPorProyecto(
        idProyecto
      );
      return res.success("Docentes obtenidos exitosamente", {
        count: docentes.length,
        items: docentes,
      });
    } catch (error) {
      console.error("Error al obtener docentes:", error);
      return res.error("Error al obtener los docentes del proyecto", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/docente-proyectos/docente/:idDocente
   * Obtener proyectos de un docente
   */
  async obtenerProyectosPorDocente(req, res) {
    try {
      const { idDocente } = req.params;
      const proyectos = await docenteProyectoService.obtenerProyectosPorDocente(
        idDocente
      );
      return res.success("Proyectos obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      return res.error("Error al obtener los proyectos del docente", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/docente-proyectos/:idDocenteProyecto
   * Actualizar asignación
   */
  async actualizarAsignacion(req, res) {
    try {
      const { idDocenteProyecto } = req.params;
      const asignacion = await docenteProyectoService.actualizarAsignacion(
        idDocenteProyecto,
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
   * DELETE /api/docente-proyectos/:idDocenteProyecto
   * Eliminar asignación
   */
  async eliminarAsignacion(req, res) {
    try {
      const { idDocenteProyecto } = req.params;
      const resultado = await docenteProyectoService.eliminarAsignacion(
        idDocenteProyecto
      );
      return res.success("Asignación eliminada exitosamente", {
        idDocenteProyecto,
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

module.exports = docenteProyectoController;
