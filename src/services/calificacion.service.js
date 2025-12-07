const db = require("../models");
const Calificacion = db.Calificacion;
const DocenteProyecto = db.DocenteProyecto;
const SubCalificacion = db.SubCalificacion;

const calificacionService = {
  /**
   * Crear una nueva calificación
   */
  async crearCalificacion(data) {
    try {
      // Validar que exista la SubCalificacion
      const subCalificacion = await SubCalificacion.findByPk(
        data.idSubCalificacion
      );
      if (!subCalificacion) {
        throw new Error("SubCalificacion no encontrada");
      }

      // Validar que el puntaje no exceda el máximo
      if (data.puntajeObtenido > subCalificacion.maximoPuntaje) {
        throw new Error(
          `El puntaje obtenido (${data.puntajeObtenido}) no puede exceder el máximo permitido (${subCalificacion.maximoPuntaje})`
        );
      }

      const calificacion = await Calificacion.create({
        puntajeObtenido: data.puntajeObtenido,
        idDocenteProyecto: data.idDocenteProyecto,
        idSubCalificacion: data.idSubCalificacion,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return calificacion;
    } catch (error) {
      console.error("Error en crearCalificacion:", error);
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
            model: DocenteProyecto,
            as: "docenteProyecto",
          },
          {
            model: SubCalificacion,
            as: "subCalificacion",
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return calificaciones;
    } catch (error) {
      console.error("Error en obtenerCalificaciones:", error);
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
            model: DocenteProyecto,
            as: "docenteProyecto",
          },
          {
            model: SubCalificacion,
            as: "subCalificacion",
          },
        ],
      });

      if (!calificacion) {
        throw new Error("Calificación no encontrada");
      }

      return calificacion;
    } catch (error) {
      console.error("Error en obtenerCalificacionPorId:", error);
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
            as: "subCalificacion",
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return calificaciones;
    } catch (error) {
      console.error("Error en obtenerCalificacionesPorDocenteProyecto:", error);
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
            as: "docenteProyecto",
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return calificaciones;
    } catch (error) {
      console.error("Error en obtenerCalificacionesPorSubCalificacion:", error);
      throw error;
    }
  },

  /**
   * Actualizar una calificación
   */
  async actualizarCalificacion(idCalificacion, data) {
    try {
      const calificacion = await Calificacion.findByPk(idCalificacion, {
        include: [
          {
            model: SubCalificacion,
            as: "subCalificacion",
          },
        ],
      });

      if (!calificacion) {
        throw new Error("Calificación no encontrada");
      }

      // Si se actualiza el puntaje, validar contra el máximo de la SubCalificacion
      if (data.puntajeObtenido !== undefined) {
        if (data.puntajeObtenido > calificacion.subCalificacion.maximoPuntaje) {
          throw new Error(
            `El puntaje obtenido (${data.puntajeObtenido}) no puede exceder el máximo permitido (${calificacion.subCalificacion.maximoPuntaje})`
          );
        }
      }

      await calificacion.update({
        puntajeObtenido:
          data.puntajeObtenido !== undefined
            ? data.puntajeObtenido
            : calificacion.puntajeObtenido,
        idDocenteProyecto:
          data.idDocenteProyecto || calificacion.idDocenteProyecto,
        idSubCalificacion:
          data.idSubCalificacion || calificacion.idSubCalificacion,
        fechaActualizacion: new Date(),
      });

      return calificacion;
    } catch (error) {
      console.error("Error en actualizarCalificacion:", error);
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
        throw new Error("Calificación no encontrada");
      }

      await calificacion.destroy();

      return { mensaje: "Calificación eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarCalificacion:", error);
      throw error;
    }
  },

  /**
   * Obtener calificaciones de un proyecto por DocenteProyecto
   * Incluye información completa de SubCalificacion para mostrar puntaje máximo
   */
  async obtenerCalificacionesProyecto(idDocenteProyecto) {
    try {
      const calificaciones = await Calificacion.findAll({
        where: { idDocenteProyecto },
        include: [
          {
            model: SubCalificacion,
            as: "subCalificacion",
            include: [
              {
                model: db.TipoCalificacion,
                as: "tipoCalificacion",
              },
            ],
          },
        ],
        order: [["fechaCreacion", "ASC"]],
      });

      return calificaciones;
    } catch (error) {
      console.error("Error en obtenerCalificacionesProyecto:", error);
      throw error;
    }
  },

  /**
   * Calificar proyecto: actualizar múltiples calificaciones
   * Solo permite calificar si no ha sido calificado previamente
   */
  async calificarProyecto(idDocenteProyecto, calificaciones) {
    const transaction = await db.sequelize.transaction();
    try {
      // Obtener todas las calificaciones del DocenteProyecto
      const calificacionesExistentes = await Calificacion.findAll({
        where: { idDocenteProyecto },
        include: [
          {
            model: SubCalificacion,
            as: "subCalificacion",
          },
        ],
        transaction,
      });

      // Verificar que ninguna calificación haya sido calificada previamente
      const yaCalificado = calificacionesExistentes.some(
        (cal) => cal.calificado === true
      );
      if (yaCalificado) {
        throw new Error(
          "Este proyecto ya ha sido calificado y no puede modificarse"
        );
      }

      // Actualizar cada calificación
      const actualizaciones = [];
      for (const calData of calificaciones) {
        const calificacion = calificacionesExistentes.find(
          (c) => c.idCalificacion === calData.idCalificacion
        );

        if (!calificacion) {
          throw new Error(
            `Calificación ${calData.idCalificacion} no encontrada`
          );
        }

        // Validar que el puntaje no exceda el máximo
        if (
          calData.puntajeObtenido > calificacion.subCalificacion.maximoPuntaje
        ) {
          throw new Error(
            `El puntaje obtenido (${calData.puntajeObtenido}) para "${calificacion.subCalificacion.nombre}" no puede exceder el máximo permitido (${calificacion.subCalificacion.maximoPuntaje})`
          );
        }

        // Actualizar la calificación
        await calificacion.update(
          {
            puntajeObtenido: calData.puntajeObtenido,
            calificado: true,
            fechaActualizacion: new Date(),
          },
          { transaction }
        );

        actualizaciones.push(calificacion);
      }

      await transaction.commit();
      return actualizaciones;
    } catch (error) {
      await transaction.rollback();
      console.error("Error en calificarProyecto:", error);
      throw error;
    }
  },
};

module.exports = calificacionService;
