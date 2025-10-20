const db = require("../models");
const SubCalificacion = db.SubCalificacion;
const TipoCalificacion = db.TipoCalificacion;
const Calificacion = db.Calificacion;

const subCalificacionService = {
  /**
   * Crear una nueva subcalificación
   */
  async crearSubCalificacion(data) {
    try {
      const subCalificacion = await SubCalificacion.create({
        nombre: data.nombre,
        maximoPuntaje: data.maximoPuntaje,
        idTipoCalificacion: data.idTipoCalificacion,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return subCalificacion;
    } catch (error) {
      console.error("Error en crearSubCalificacion:", error);
      throw error;
    }
  },
  /**
   * Obtener todas las subcalificaciones
   */
  async obtenerSubCalificaciones() {
    try {
      const subCalificaciones = await SubCalificacion.findAll({
        include: [
          {
            model: TipoCalificacion,
            as: "tipoCalificacion",
          },
          {
            model: Calificacion,
            as: "calificaciones",
          },
        ],
        order: [["nombre", "ASC"]],
      });

      return subCalificaciones;
    } catch (error) {
      console.error("Error en obtenerSubCalificaciones:", error);
      throw error;
    }
  },

  /**
   * Obtener una subcalificación por ID
   */
  async obtenerSubCalificacionPorId(idSubCalificacion) {
    try {
      const subCalificacion = await SubCalificacion.findByPk(
        idSubCalificacion,
        {
          include: [
            {
              model: TipoCalificacion,
              as: "tipoCalificacion",
            },
            {
              model: Calificacion,
              as: "calificaciones",
            },
          ],
        }
      );

      if (!subCalificacion) {
        throw new Error("Subcalificación no encontrada");
      }

      return subCalificacion;
    } catch (error) {
      console.error("Error en obtenerSubCalificacionPorId:", error);
      throw error;
    }
  },

  /**
   * Obtener subcalificaciones por tipo
   */
  async obtenerSubCalificacionesPorTipo(idTipoCalificacion) {
    try {
      const subCalificaciones = await SubCalificacion.findAll({
        where: { idTipoCalificacion },
        include: [
          {
            model: TipoCalificacion,
            as: "tipoCalificacion",
          },
        ],
        order: [["nombre", "ASC"]],
      });

      return subCalificaciones;
    } catch (error) {
      console.error("Error en obtenerSubCalificacionesPorTipo:", error);
      throw error;
    }
  },

  /**
   * Actualizar una subcalificación
   */
  async actualizarSubCalificacion(idSubCalificacion, data) {
    try {
      const subCalificacion = await SubCalificacion.findByPk(idSubCalificacion);

      if (!subCalificacion) {
        throw new Error("Subcalificación no encontrada");
      }

      await subCalificacion.update({
        nombre: data.nombre || subCalificacion.nombre,
        maximoPuntaje:
          data.maximoPuntaje !== undefined
            ? data.maximoPuntaje
            : subCalificacion.maximoPuntaje,
        idTipoCalificacion:
          data.idTipoCalificacion || subCalificacion.idTipoCalificacion,
        fechaActualizacion: new Date(),
      });

      return subCalificacion;
    } catch (error) {
      console.error("Error en actualizarSubCalificacion:", error);
      throw error;
    }
  },

  /**
   * Eliminar una subcalificación
   */
  async eliminarSubCalificacion(idSubCalificacion) {
    try {
      const subCalificacion = await SubCalificacion.findByPk(idSubCalificacion);

      if (!subCalificacion) {
        throw new Error("Subcalificación no encontrada");
      }

      await subCalificacion.destroy();

      return { mensaje: "Subcalificación eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarSubCalificacion:", error);
      throw error;
    }
  },
};

module.exports = subCalificacionService;
