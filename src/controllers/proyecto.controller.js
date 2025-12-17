const proyectoService = require("../services/proyecto.service");

const proyectoController = {
  /**
   * POST /api/proyectos
   * Crear un nuevo proyecto
   */
  async crearProyecto(req, res) {
    try {
      const { nombre, descripcion, idGrupoMateria } = req.body;

      if (!nombre || !descripcion || !idGrupoMateria) {
        return res.validationError(
          "Los campos nombre, descripcion e idGrupoMateria son requeridos"
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

  /**
   * GET /api/proyectos/mis-proyectos
   * Obtener los proyectos del estudiante autenticado
   */
  async obtenerMisProyectos(req, res) {
    try {
      const idUsuario = req.user.idUsuario;
      const proyectos = await proyectoService.obtenerMisProyectos(idUsuario);
      return res.success("Mis proyectos obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener mis proyectos:", error);

      if (error.message === "Estudiante no encontrado") {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: error.message,
          }
        );
      }

      return res.error("Error al obtener los proyectos", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },
  /**
   * GET /api/proyectos/:idProyecto/integrantes
   * Obtener integrantes del proyecto
   */
  async obtenerIntegrantesProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const integrantes = await proyectoService.obtenerIntegrantesProyecto(
        idProyecto
      );
      return res.success("Integrantes obtenidos exitosamente", {
        count: integrantes.length,
        items: integrantes,
      });
    } catch (error) {
      console.error("Error al obtener integrantes:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al obtener los integrantes", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/:idProyecto/tareas-organizadas
   * Obtener tareas organizadas por estado (En Proceso, Completado, Pendiente)
   */
  async obtenerTareasOrganizadas(req, res) {
    try {
      const { idProyecto } = req.params;
      const tareasOrganizadas = await proyectoService.obtenerTareasOrganizadas(
        idProyecto
      );
      return res.success(
        "Tareas organizadas obtenidas exitosamente",
        tareasOrganizadas
      );
    } catch (error) {
      console.error("Error al obtener tareas organizadas:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al obtener las tareas organizadas", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/:idProyecto/contenido-editor
   * Obtener contenido del proyecto para el editor con imágenes
   */
  async obtenerContenidoEditor(req, res) {
    try {
      const { idProyecto } = req.params;

      if (!idProyecto) {
        return res.validationError("El idProyecto es requerido");
      }

      const contenido = await proyectoService.obtenerContenidoEditor(
        idProyecto
      );
      return res.success("Contenido obtenido exitosamente", contenido);
    } catch (error) {
      console.error("Error al obtener contenido del editor:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al obtener el contenido", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/mis-proyectos-lider
   * Obtener proyectos donde el estudiante es líder
   */
  async obtenerMisProyectosComoLider(req, res) {
    try {
      const idUsuario = req.user.idUsuario;
      const proyectos = await proyectoService.obtenerProyectosComoLider(
        idUsuario
      );
      return res.success("Proyectos como líder obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos como líder:", error);

      if (error.message === "Estudiante no encontrado") {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: error.message,
          }
        );
      }

      return res.error("Error al obtener los proyectos", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/mis-proyectos-invitados
   * Obtener proyectos donde el estudiante tiene invitación pendiente
   */
  async obtenerMisProyectosInvitados(req, res) {
    try {
      const idUsuario = req.user.idUsuario;
      const proyectos =
        await proyectoService.obtenerProyectosConInvitacionPendiente(idUsuario);
      return res.success("Proyectos con invitación obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos con invitación:", error);

      if (error.message === "Estudiante no encontrado") {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: error.message,
          }
        );
      }

      return res.error("Error al obtener los proyectos", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/:idProyecto/invitaciones
   * Obtener todas las invitaciones enviadas de un proyecto
   */
  async obtenerInvitacionesProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const invitaciones = await proyectoService.obtenerInvitacionesProyecto(
        idProyecto
      );
      return res.success("Invitaciones obtenidas exitosamente", {
        count: invitaciones.length,
        items: invitaciones,
      });
    } catch (error) {
      console.error("Error al obtener invitaciones del proyecto:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al obtener las invitaciones", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/aprobados-feria
   * Obtener proyectos aprobados para feria (esFinal = true) de la feria activa
   */
  async obtenerProyectosAprobadosFeria(req, res) {
    try {
      const proyectos = await proyectoService.obtenerProyectosAprobadosFeria();

      // Configurar cache para reducir consultas repetidas
      res.set("Cache-Control", "public, max-age=30"); // Cache de 30 segundos

      return res.success(
        "Proyectos aprobados para feria obtenidos exitosamente",
        proyectos
      );
    } catch (error) {
      console.error("Error al obtener proyectos aprobados para feria:", error);
      // Si no hay feria activa, devolver respuesta 404
      if (error.message === "No hay feria activa") {
        return res.error("No hay feria activa", 404, {
          code: "NO_ACTIVE_FERIA",
          details: error.message,
        });
      }
      return res.error(
        "Error al obtener los proyectos aprobados para feria",
        500,
        {
          code: "FETCH_ERROR",
          details: error.message,
        }
      );
    }
  },

  /**
   * GET /api/proyectos/materia/:idMateria
   * Obtener proyectos de una materia específica
   */
  async obtenerProyectosPorMateria(req, res) {
    try {
      const { idMateria } = req.params;
      const proyectos = await proyectoService.obtenerProyectosPorMateria(
        idMateria
      );

      return res.success("Proyectos de la materia obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos por materia:", error);
      return res.error("Error al obtener los proyectos de la materia", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/proyectos/:idProyecto/aprobar-tutor
   * Actualizar el estado de aprobación del tutor
   */
  async actualizarProyectoAprobadoTutor(req, res) {
    try {
      const { idProyecto } = req.params;
      const { estaAprobado } = req.body;

      if (typeof estaAprobado !== "boolean") {
        return res.validationError(
          "El campo estaAprobado es requerido y debe ser un valor booleano"
        );
      }

      await proyectoService.actualizarProyectoAprobadoTutor(
        idProyecto,
        estaAprobado
      );

      return res.success(
        estaAprobado
          ? "Proyecto aprobado exitosamente"
          : "Proyecto rechazado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar aprobación del tutor:", error);
      return res.error("Error al actualizar la aprobación del tutor", 500, {
        code: "UPDATE_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/:idProyecto/nota-promedio
   * Obtener la nota promedio de un proyecto
   */
  async obtenerNotaPromedioProyecto(req, res) {
    try {
      const { idProyecto } = req.params;
      const resultado = await proyectoService.obtenerNotaPromedioProyecto(
        idProyecto
      );

      return res.success("Nota promedio obtenida exitosamente", resultado);
    } catch (error) {
      console.error("Error al obtener nota promedio:", error);

      if (error.message === "Proyecto no encontrado") {
        return res.notFound("Proyecto");
      }

      return res.error("Error al obtener la nota promedio", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/mis-proyectos-actuales
   * Obtener proyectos actuales del estudiante (vinculados a feria activa)
   */
  async obtenerMisProyectosActuales(req, res) {
    try {
      const idUsuario = req.user.idUsuario;
      const proyectos = await proyectoService.obtenerMisProyectosActuales(
        idUsuario
      );
      return res.success("Proyectos actuales obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos actuales:", error);

      if (error.message === "Estudiante no encontrado") {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: error.message,
          }
        );
      }

      return res.error("Error al obtener los proyectos actuales", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/mis-proyectos-pasados
   * Obtener proyectos pasados del estudiante (todos menos los de feria activa)
   */
  async obtenerMisProyectosPasados(req, res) {
    try {
      const idUsuario = req.user.idUsuario;
      const proyectos = await proyectoService.obtenerMisProyectosPasados(
        idUsuario
      );
      return res.success("Proyectos pasados obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos pasados:", error);

      if (error.message === "Estudiante no encontrado") {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: error.message,
          }
        );
      }

      return res.error("Error al obtener los proyectos pasados", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/mis-proyectos-invitados-actuales
   * Obtener proyectos invitados actuales del estudiante (vinculados a feria activa)
   */
  async obtenerMisProyectosInvitadosActuales(req, res) {
    try {
      const idUsuario = req.user.idUsuario;
      const proyectos = await proyectoService.obtenerProyectosInvitadosActuales(
        idUsuario
      );
      return res.success("Proyectos invitados actuales obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos invitados actuales:", error);

      if (error.message === "Estudiante no encontrado") {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: error.message,
          }
        );
      }

      return res.error("Error al obtener los proyectos invitados actuales", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },

  /**
   * GET /api/proyectos/mis-proyectos-invitados-pasados
   * Obtener proyectos invitados pasados del estudiante (todos menos los de feria activa)
   */
  async obtenerMisProyectosInvitadosPasados(req, res) {
    try {
      const idUsuario = req.user.idUsuario;
      const proyectos = await proyectoService.obtenerProyectosInvitadosPasados(
        idUsuario
      );
      return res.success("Proyectos invitados pasados obtenidos exitosamente", {
        count: proyectos.length,
        items: proyectos,
      });
    } catch (error) {
      console.error("Error al obtener proyectos invitados pasados:", error);

      if (error.message === "Estudiante no encontrado") {
        return res.error(
          "No se encontró un estudiante asociado a este usuario",
          404,
          {
            code: "STUDENT_NOT_FOUND",
            details: error.message,
          }
        );
      }

      return res.error("Error al obtener los proyectos invitados pasados", 500, {
        code: "FETCH_ERROR",
        details: error.message,
      });
    }
  },
};

module.exports = proyectoController;
