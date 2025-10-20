const db = require('../models');
const EstudianteProyecto = db.EstudianteProyecto;
const Estudiante = db.Estudiante;
const Proyecto = db.Proyecto;

const estudianteProyectoService = {
  /**
   * Asignar un estudiante a un proyecto
   */
  async asignarEstudianteAProyecto(data) {
    try {
      const estudianteProyecto = await EstudianteProyecto.create({
        idEstudiante: data.idEstudiante,
        idProyecto: data.idProyecto,
        esLider: data.esLider || false,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return estudianteProyecto;
    } catch (error) {
      console.error('Error en asignarEstudianteAProyecto:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las asignaciones
   */
  async obtenerAsignaciones() {
    try {
      const asignaciones = await EstudianteProyecto.findAll({
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
          },
          {
            model: Proyecto,
            as: 'proyecto',
          },
        ],
        order: [['fechaCreacion', 'DESC']],
      });

      return asignaciones;
    } catch (error) {
      console.error('Error en obtenerAsignaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener estudiantes de un proyecto
   */
  async obtenerEstudiantesPorProyecto(idProyecto) {
    try {
      const estudiantes = await EstudianteProyecto.findAll({
        where: { idProyecto },
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
          },
        ],
      });

      return estudiantes;
    } catch (error) {
      console.error('Error en obtenerEstudiantesPorProyecto:', error);
      throw error;
    }
  },

  /**
   * Obtener proyectos de un estudiante
   */
  async obtenerProyectosPorEstudiante(idEstudiante) {
    try {
      const proyectos = await EstudianteProyecto.findAll({
        where: { idEstudiante },
        include: [
          {
            model: Proyecto,
            as: 'proyecto',
          },
        ],
      });

      return proyectos;
    } catch (error) {
      console.error('Error en obtenerProyectosPorEstudiante:', error);
      throw error;
    }
  },

  /**
   * Actualizar asignación (cambiar si es líder)
   */
  async actualizarAsignacion(idEstudianteProyecto, data) {
    try {
      const asignacion = await EstudianteProyecto.findByPk(idEstudianteProyecto);

      if (!asignacion) {
        throw new Error('Asignación no encontrada');
      }

      await asignacion.update({
        esLider: data.esLider !== undefined ? data.esLider : asignacion.esLider,
        fechaActualizacion: new Date(),
      });

      return asignacion;
    } catch (error) {
      console.error('Error en actualizarAsignacion:', error);
      throw error;
    }
  },

  /**
   * Eliminar asignación (quitar estudiante de proyecto)
   */
  async eliminarAsignacion(idEstudianteProyecto) {
    try {
      const asignacion = await EstudianteProyecto.findByPk(idEstudianteProyecto);

      if (!asignacion) {
        throw new Error('Asignación no encontrada');
      }

      await asignacion.destroy();

      return { mensaje: 'Estudiante removido del proyecto exitosamente' };
    } catch (error) {
      console.error('Error en eliminarAsignacion:', error);
      throw error;
    }
  },
};

module.exports = estudianteProyectoService;
