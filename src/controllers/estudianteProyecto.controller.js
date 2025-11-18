const estudianteProyectoService = require("../services/estudianteProyecto.service");
const estudianteService = require("../services/estudiante.service");

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

  /**
   * POST /api/estudiante-proyecto/invitacion
   * Crear una nueva invitación
   */
  async crearInvitacion(req, res) {
    try {
      const { codigoEstudiante, idProyecto } = req.body;

      if (!codigoEstudiante || !idProyecto) {
        return res.validationError(
          "Los campos codigoEstudiante e idProyecto son requeridos"
        );
      }

      // Buscar al estudiante por su código
      const estudiante = await estudianteService.obtenerEstudiantePorCodigo(
        codigoEstudiante
      );

      if (!estudiante) {
        return res.error("Estudiante no encontrado", 404, {
          code: "STUDENT_NOT_FOUND",
          details: `No se encontró un estudiante con el código ${codigoEstudiante}`,
        });
      }

      const invitacion = await estudianteProyectoService.crearInvitacion({
        idEstudiante: estudiante.idEstudiante,
        idProyecto,
      });

      return res.success("Invitación creada exitosamente", invitacion, 201);
    } catch (error) {
      console.error("Error al crear invitación:", error);
      return res.error("Error al crear la invitación", 500, {
        code: "CREATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/estudiante-proyecto/mis-invitaciones
   * Obtener las invitaciones del estudiante autenticado
   */
  async obtenerMisInvitaciones(req, res) {
    try {
      const idUsuario = req.user.idUsuario;

      // Obtener el estudiante asociado al idUsuario
      const estudiante = await estudianteService.obtenerEstudiantePorUsuario(
        idUsuario
      );

      if (!estudiante) {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: "El idUsuario no tiene un estudiante asociado",
          }
        );
      }

      const invitaciones =
        await estudianteProyectoService.obtenerMisInvitaciones(
          estudiante.idEstudiante
        );

      return res.success(
        {
          count: invitaciones.length,
          items: invitaciones,
        },
        "Invitaciones obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener invitaciones:", error);
      return res.error("Error al obtener las invitaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = estudianteProyectoController;
