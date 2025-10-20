const estudianteProyectoService = require('../services/estudianteProyecto.service');

const estudianteProyectoController = {
  /**
   * POST /api/estudiante-proyectos
   * Asignar un estudiante a un proyecto
   */
  async asignarEstudianteAProyecto(req, res) {
    try {
      const { idEstudiante, idProyecto } = req.body;

      if (!idEstudiante || !idProyecto) {
        return res.status(400).json({
          error: 'Los campos idEstudiante e idProyecto son requeridos',
        });
      }

      const asignacion = await estudianteProyectoService.asignarEstudianteAProyecto(req.body);

      return res.status(201).json({
        mensaje: 'Estudiante asignado al proyecto exitosamente',
        asignacion,
      });
    } catch (error) {
      console.error('Error al asignar estudiante:', error);
      return res.status(500).json({
        error: error.message || 'Error al asignar estudiante al proyecto',
      });
    }
  },

  /**
   * GET /api/estudiante-proyectos
   * Obtener todas las asignaciones
   */
  async obtenerAsignaciones(req, res) {
    try {
      const asignaciones = await estudianteProyectoService.obtenerAsignaciones();

      return res.status(200).json({
        mensaje: 'Asignaciones obtenidas exitosamente',
        cantidad: asignaciones.length,
        asignaciones,
      });
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener las asignaciones',
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

      const estudiantes = await estudianteProyectoService.obtenerEstudiantesPorProyecto(
        idProyecto
      );

      return res.status(200).json({
        mensaje: 'Estudiantes obtenidos exitosamente',
        cantidad: estudiantes.length,
        estudiantes,
      });
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener los estudiantes del proyecto',
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

      const proyectos = await estudianteProyectoService.obtenerProyectosPorEstudiante(
        idEstudiante
      );

      return res.status(200).json({
        mensaje: 'Proyectos obtenidos exitosamente',
        cantidad: proyectos.length,
        proyectos,
      });
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener los proyectos del estudiante',
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

      return res.status(200).json({
        mensaje: 'Asignación actualizada exitosamente',
        asignacion,
      });
    } catch (error) {
      console.error('Error al actualizar asignación:', error);

      if (error.message === 'Asignación no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al actualizar la asignación',
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

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar asignación:', error);

      if (error.message === 'Asignación no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al eliminar la asignación',
      });
    }
  },
};

module.exports = estudianteProyectoController;
