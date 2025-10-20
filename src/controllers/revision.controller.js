const revisionService = require('../services/revision.service');

const revisionController = {
  /**
   * POST /api/revisiones
   * Crear una nueva revisión
   */
  async crearRevision(req, res) {
    try {
      const { nombre, descripcion, fechaLimite, idProyecto } = req.body;

      if (!nombre || !descripcion || !fechaLimite || !idProyecto) {
        return res.status(400).json({
          error: 'Los campos nombre, descripcion, fechaLimite e idProyecto son requeridos',
        });
      }

      const revision = await revisionService.crearRevision(req.body);

      return res.status(201).json({
        mensaje: 'Revisión creada exitosamente',
        revision,
      });
    } catch (error) {
      console.error('Error al crear revisión:', error);
      return res.status(500).json({
        error: error.message || 'Error al crear la revisión',
      });
    }
  },

  /**
   * GET /api/revisiones
   * Obtener todas las revisiones
   */
  async obtenerRevisiones(req, res) {
    try {
      const revisiones = await revisionService.obtenerRevisiones();

      return res.status(200).json({
        mensaje: 'Revisiones obtenidas exitosamente',
        cantidad: revisiones.length,
        revisiones,
      });
    } catch (error) {
      console.error('Error al obtener revisiones:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener las revisiones',
      });
    }
  },

  /**
   * GET /api/revisiones/:idRevision
   * Obtener una revisión por ID
   */
  async obtenerRevisionPorId(req, res) {
    try {
      const { idRevision } = req.params;

      const revision = await revisionService.obtenerRevisionPorId(idRevision);

      return res.status(200).json({
        mensaje: 'Revisión obtenida exitosamente',
        revision,
      });
    } catch (error) {
      console.error('Error al obtener revisión:', error);

      if (error.message === 'Revisión no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al obtener la revisión',
      });
    }
  },

  /**
   * GET /api/revisiones/proyecto/:idProyecto
   * Obtener revisiones por proyecto
   */
  async obtenerRevisionesPorProyecto(req, res) {
    try {
      const { idProyecto } = req.params;

      const revisiones = await revisionService.obtenerRevisionesPorProyecto(idProyecto);

      return res.status(200).json({
        mensaje: 'Revisiones obtenidas exitosamente',
        cantidad: revisiones.length,
        revisiones,
      });
    } catch (error) {
      console.error('Error al obtener revisiones:', error);
      return res.status(500).json({
        error: error.message || 'Error al obtener las revisiones del proyecto',
      });
    }
  },

  /**
   * PUT /api/revisiones/:idRevision
   * Actualizar una revisión
   */
  async actualizarRevision(req, res) {
    try {
      const { idRevision } = req.params;

      const revision = await revisionService.actualizarRevision(idRevision, req.body);

      return res.status(200).json({
        mensaje: 'Revisión actualizada exitosamente',
        revision,
      });
    } catch (error) {
      console.error('Error al actualizar revisión:', error);

      if (error.message === 'Revisión no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al actualizar la revisión',
      });
    }
  },

  /**
   * DELETE /api/revisiones/:idRevision
   * Eliminar una revisión
   */
  async eliminarRevision(req, res) {
    try {
      const { idRevision } = req.params;

      const resultado = await revisionService.eliminarRevision(idRevision);

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar revisión:', error);

      if (error.message === 'Revisión no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || 'Error al eliminar la revisión',
      });
    }
  },
};

module.exports = revisionController;
