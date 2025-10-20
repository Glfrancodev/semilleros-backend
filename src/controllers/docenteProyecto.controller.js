const docenteProyectoService = require('../services/docenteProyecto.service');

const docenteProyectoController = {
  /**
   * POST /api/docente-proyectos
   * Asignar un docente a un proyecto
   */
  async asignarDocenteAProyecto(req, res) {
    try {
      const { idDocente, idProyecto } = req.body;

      if (!idDocente || !idProyecto) {
        return res.status(400).json({
          error: 'Los campos idDocente e idProyecto son requeridos',
        });
      }

      const asignacion = await docenteProyectoService.asignarDocenteAProyecto(req.body);

      return res.status(201).json({
        mensaje: 'Docente asignado al proyecto exitosamente',
        asignacion,
      });
    } catch (error) {
      console.error('Error al asignar docente:', error);
      return res.status(500).json({
        error: error.message || 'Error al asignar docente al proyecto',
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
   * GET /api/docente-proyectos/:idDocenteProyecto
   * Obtener una asignación por ID
   */
  async obtenerAsignacionPorId(req, res) {
    try {
      const { idDocenteProyecto } = req.params;

      const asignacion = await docenteProyectoService.obtenerAsignacionPorId(idDocenteProyecto);

      return res.status(200).json({
        mensaje: 'Asignación obtenida exitosamente',
        asignacion,
      });
    } catch (error) {
      console.error('Error al obtener asignación:', error);

      if (error.message === 'Asignación no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al obtener la asignación',
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

      const docentes = await docenteProyectoService.obtenerDocentesPorProyecto(idProyecto);

      return res.status(200).json({
        mensaje: 'Docentes obtenidos exitosamente',
        cantidad: docentes.length,
        docentes,
      });
    } catch (error) {
      console.error('Error al obtener docentes:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener los docentes del proyecto',
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

      const proyectos = await docenteProyectoService.obtenerProyectosPorDocente(idDocente);

      return res.status(200).json({
        mensaje: 'Proyectos obtenidos exitosamente',
        cantidad: proyectos.length,
        proyectos,
      });
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener los proyectos del docente',
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
   * DELETE /api/docente-proyectos/:idDocenteProyecto
   * Eliminar asignación
   */
  async eliminarAsignacion(req, res) {
    try {
      const { idDocenteProyecto } = req.params;

      const resultado = await docenteProyectoService.eliminarAsignacion(idDocenteProyecto);

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

module.exports = docenteProyectoController;
