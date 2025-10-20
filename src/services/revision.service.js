const db = require('../models');
const Revision = db.Revision;
const Proyecto = db.Proyecto;

const revisionService = {
  /**
   * Crear una nueva revisión
   */
  async crearRevision(data) {
    try {
      const revision = await Revision.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        fechaLimite: data.fechaLimite,
        contenidoEnviado: data.contenidoEnviado || null,
        idProyecto: data.idProyecto,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return revision;
    } catch (error) {
      console.error('Error en crearRevision:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las revisiones
   */
  async obtenerRevisiones() {
    try {
      const revisiones = await Revision.findAll({
        include: [
          {
            model: Proyecto,
            as: 'proyecto',
            attributes: ['idProyecto', 'nombre'],
          },
        ],
        order: [['fechaLimite', 'ASC']],
      });

      return revisiones;
    } catch (error) {
      console.error('Error en obtenerRevisiones:', error);
      throw error;
    }
  },

  /**
   * Obtener una revisión por ID
   */
  async obtenerRevisionPorId(idRevision) {
    try {
      const revision = await Revision.findByPk(idRevision, {
        include: [
          {
            model: Proyecto,
            as: 'proyecto',
          },
        ],
      });

      if (!revision) {
        throw new Error('Revisión no encontrada');
      }

      return revision;
    } catch (error) {
      console.error('Error en obtenerRevisionPorId:', error);
      throw error;
    }
  },

  /**
   * Obtener revisiones por proyecto
   */
  async obtenerRevisionesPorProyecto(idProyecto) {
    try {
      const revisiones = await Revision.findAll({
        where: { idProyecto },
        order: [['fechaLimite', 'ASC']],
      });

      return revisiones;
    } catch (error) {
      console.error('Error en obtenerRevisionesPorProyecto:', error);
      throw error;
    }
  },

  /**
   * Actualizar una revisión
   */
  async actualizarRevision(idRevision, data) {
    try {
      const revision = await Revision.findByPk(idRevision);

      if (!revision) {
        throw new Error('Revisión no encontrada');
      }

      await revision.update({
        nombre: data.nombre || revision.nombre,
        descripcion: data.descripcion || revision.descripcion,
        fechaLimite: data.fechaLimite || revision.fechaLimite,
        contenidoEnviado: data.contenidoEnviado !== undefined ? data.contenidoEnviado : revision.contenidoEnviado,
        fechaActualizacion: new Date(),
      });

      return revision;
    } catch (error) {
      console.error('Error en actualizarRevision:', error);
      throw error;
    }
  },

  /**
   * Eliminar una revisión
   */
  async eliminarRevision(idRevision) {
    try {
      const revision = await Revision.findByPk(idRevision);

      if (!revision) {
        throw new Error('Revisión no encontrada');
      }

      await revision.destroy();

      return { mensaje: 'Revisión eliminada exitosamente' };
    } catch (error) {
      console.error('Error en eliminarRevision:', error);
      throw error;
    }
  },
};

module.exports = revisionService;
