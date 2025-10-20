const db = require('../models');
const Calificacion = db.Calificacion;
const SubCalificacion = db.SubCalificacion;
const DocenteProyecto = db.DocenteProyecto;

const calificacionService = {
  /**
   * Crear una nueva calificación
   */
  async crearCalificacion(data) {
    try {
      const calificacion = await Calificacion.create({
        puntajeObtenido: data.puntajeObtenido,
        idSubCalificacion: data.idSubCalificacion,
        idDocenteProyecto: data.idDocenteProyecto,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return calificacion;
    } catch (error) {
      console.error('Error en crearCalificacion:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las calificaciones
   */
  async obtenerCalificaciones() {
    try {
      const calificaciones = await Calificacion.findAll({
        include: [
          {
            model: SubCalificacion,
            as: 'subCalificacion',
          },
          {
            model: DocenteProyecto,
            as: 'docenteProyecto',
          },
        ],
        order: [['fechaCreacion', 'DESC']],
      });

      return calificaciones;
    } catch (error) {
      console.error('Error en obtenerCalificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener una calificación por ID
   */
  async obtenerCalificacionPorId(idCalificacion) {
    try {
      const calificacion = await Calificacion.findByPk(idCalificacion, {
        include: [
          {
            model: SubCalificacion,
            as: 'subCalificacion',
          },
          {
            model: DocenteProyecto,
            as: 'docenteProyecto',
          },
        ],
      });

      if (!calificacion) {
        throw new Error('Calificación no encontrada');
      }

      return calificacion;
    } catch (error) {
      console.error('Error en obtenerCalificacionPorId:', error);
      throw error;
    }
  },

  /**
   * Obtener calificaciones por DocenteProyecto
   */
  async obtenerCalificacionesPorDocenteProyecto(idDocenteProyecto) {
    try {
      const calificaciones = await Calificacion.findAll({
        where: { idDocenteProyecto },
        include: [
          {
            model: SubCalificacion,
            as: 'subCalificacion',
          },
        ],
        order: [['fechaCreacion', 'DESC']],
      });

      return calificaciones;
    } catch (error) {
      console.error('Error en obtenerCalificacionesPorDocenteProyecto:', error);
      throw error;
    }
  },

  /**
   * Obtener calificaciones por SubCalificacion
   */
  async obtenerCalificacionesPorSubCalificacion(idSubCalificacion) {
    try {
      const calificaciones = await Calificacion.findAll({
        where: { idSubCalificacion },
        include: [
          {
            model: DocenteProyecto,
            as: 'docenteProyecto',
          },
        ],
        order: [['fechaCreacion', 'DESC']],
      });

      return calificaciones;
    } catch (error) {
      console.error('Error en obtenerCalificacionesPorSubCalificacion:', error);
      throw error;
    }
  },

  /**
   * Actualizar una calificación
   */
  async actualizarCalificacion(idCalificacion, data) {
    try {
      const calificacion = await Calificacion.findByPk(idCalificacion);

      if (!calificacion) {
        throw new Error('Calificación no encontrada');
      }

      await calificacion.update({
        puntajeObtenido: data.puntajeObtenido !== undefined ? data.puntajeObtenido : calificacion.puntajeObtenido,
        idSubCalificacion: data.idSubCalificacion || calificacion.idSubCalificacion,
        idDocenteProyecto: data.idDocenteProyecto || calificacion.idDocenteProyecto,
        fechaActualizacion: new Date(),
      });

      return calificacion;
    } catch (error) {
      console.error('Error en actualizarCalificacion:', error);
      throw error;
    }
  },

  /**
   * Eliminar una calificación
   */
  async eliminarCalificacion(idCalificacion) {
    try {
      const calificacion = await Calificacion.findByPk(idCalificacion);

      if (!calificacion) {
        throw new Error('Calificación no encontrada');
      }

      await calificacion.destroy();

      return { mensaje: 'Calificación eliminada exitosamente' };
    } catch (error) {
      console.error('Error en eliminarCalificacion:', error);
      throw error;
    }
  },
};

module.exports = calificacionService;
