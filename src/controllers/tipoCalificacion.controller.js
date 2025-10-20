const tipoCalificacionService = require('../services/tipoCalificacion.service');

const tipoCalificacionController = {
  /**
   * POST /api/tipos-calificacion
   * Crear un nuevo tipo de calificación
   */
  async crearTipoCalificacion(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const tipo = await tipoCalificacionService.crearTipoCalificacion(req.body);

      return res.status(201).json({
        mensaje: 'Tipo de calificación creado exitosamente',
        tipoCalificacion: tipo,
      });
    } catch (error) {
      console.error('Error al crear tipo de calificación:', error);
      return res.status(500).json({
        error: error.message || 'Error al crear el tipo de calificación',
      });
    }
  },

  /**
   * GET /api/tipos-calificacion
   * Obtener todos los tipos de calificación
   */
  async obtenerTiposCalificacion(req, res) {
    try {
      const tipos = await tipoCalificacionService.obtenerTiposCalificacion();

      return res.status(200).json({
        mensaje: 'Tipos de calificación obtenidos exitosamente',
        cantidad: tipos.length,
        tiposCalificacion: tipos,
      });
    } catch (error) {
      console.error('Error al obtener tipos de calificación:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener los tipos de calificación',
      });
    }
  },

  /**
   * GET /api/tipos-calificacion/:idTipoCalificacion
   * Obtener un tipo de calificación por ID
   */
  async obtenerTipoCalificacionPorId(req, res) {
    try {
      const { idTipoCalificacion } = req.params;

      const tipo = await tipoCalificacionService.obtenerTipoCalificacionPorId(
        idTipoCalificacion
      );

      return res.status(200).json({
        mensaje: 'Tipo de calificación obtenido exitosamente',
        tipoCalificacion: tipo,
      });
    } catch (error) {
      console.error('Error al obtener tipo de calificación:', error);

      if (error.message === 'Tipo de calificación no encontrado') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al obtener el tipo de calificación',
      });
    }
  },

  /**
   * PUT /api/tipos-calificacion/:idTipoCalificacion
   * Actualizar un tipo de calificación
   */
  async actualizarTipoCalificacion(req, res) {
    try {
      const { idTipoCalificacion } = req.params;

      const tipo = await tipoCalificacionService.actualizarTipoCalificacion(
        idTipoCalificacion,
        req.body
      );

      return res.status(200).json({
        mensaje: 'Tipo de calificación actualizado exitosamente',
        tipoCalificacion: tipo,
      });
    } catch (error) {
      console.error('Error al actualizar tipo de calificación:', error);

      if (error.message === 'Tipo de calificación no encontrado') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al actualizar el tipo de calificación',
      });
    }
  },

  /**
   * DELETE /api/tipos-calificacion/:idTipoCalificacion
   * Eliminar un tipo de calificación
   */
  async eliminarTipoCalificacion(req, res) {
    try {
      const { idTipoCalificacion } = req.params;

      const resultado = await tipoCalificacionService.eliminarTipoCalificacion(
        idTipoCalificacion
      );

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar tipo de calificación:', error);

      if (error.message === 'Tipo de calificación no encontrado') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al eliminar el tipo de calificación',
      });
    }
  },
};

module.exports = tipoCalificacionController;
