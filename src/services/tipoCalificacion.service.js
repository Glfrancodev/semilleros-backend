const db = require("../models");
const TipoCalificacion = db.TipoCalificacion;
const SubCalificacion = db.SubCalificacion;
const Administrativo = db.Administrativo;
const Usuario = db.Usuario;

const tipoCalificacionService = {
  /**
   * Crear un nuevo tipo de calificación
   */
  async crearTipoCalificacion(data) {
    try {
      const tipoCalificacion = await TipoCalificacion.create({
        nombre: data.nombre,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: data.creadoPor,
        actualizadoPor: data.actualizadoPor, // Al crear, el creador también es el actualizador
      });

      return tipoCalificacion;
    } catch (error) {
      console.error("Error en crearTipoCalificacion:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los tipos de calificación
   */
  async obtenerTiposCalificacion() {
    try {
      const tipos = await TipoCalificacion.findAll({
        include: [
          {
            model: SubCalificacion,
            as: "subCalificaciones",
          },
          {
            model: Administrativo,
            as: "creador",
            attributes: ["idAdministrativo", "codigoAdministrativo"],
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "actualizador",
            attributes: ["idAdministrativo", "codigoAdministrativo"],
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
        ],
        order: [["nombre", "ASC"]],
      });

      return tipos;
    } catch (error) {
      console.error("Error en obtenerTiposCalificacion:", error);
      throw error;
    }
  },

  /**
   * Obtener un tipo de calificación por ID
   */
  async obtenerTipoCalificacionPorId(idTipoCalificacion) {
    try {
      const tipo = await TipoCalificacion.findByPk(idTipoCalificacion, {
        include: [
          {
            model: SubCalificacion,
            as: "subCalificaciones",
          },
          {
            model: Administrativo,
            as: "creador",
            attributes: ["idAdministrativo", "codigoAdministrativo"],
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
          {
            model: Administrativo,
            as: "actualizador",
            attributes: ["idAdministrativo", "codigoAdministrativo"],
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido", "correo"],
              },
            ],
          },
        ],
      });

      if (!tipo) {
        throw new Error("Tipo de calificación no encontrado");
      }

      console.log(
        `🔍 TipoCalificacion ${idTipoCalificacion} tiene ${
          tipo.subCalificaciones?.length || 0
        } subCalificaciones`
      );
      console.log(
        "🔍 SubCalificaciones:",
        JSON.stringify(tipo.subCalificaciones, null, 2)
      );

      return tipo;
    } catch (error) {
      console.error("Error en obtenerTipoCalificacionPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar un tipo de calificación
   */
  async actualizarTipoCalificacion(idTipoCalificacion, data) {
    try {
      const tipo = await TipoCalificacion.findByPk(idTipoCalificacion);

      if (!tipo) {
        throw new Error("Tipo de calificación no encontrado");
      }

      await tipo.update({
        nombre: data.nombre || tipo.nombre,
        fechaActualizacion: new Date(),
        actualizadoPor: data.actualizadoPor,
      });

      return tipo;
    } catch (error) {
      console.error("Error en actualizarTipoCalificacion:", error);
      throw error;
    }
  },

  /**
   * Eliminar un tipo de calificación
   */
  async eliminarTipoCalificacion(idTipoCalificacion) {
    try {
      const tipo = await TipoCalificacion.findByPk(idTipoCalificacion);

      if (!tipo) {
        throw new Error("Tipo de calificación no encontrado");
      }

      await tipo.destroy();

      return { mensaje: "Tipo de calificación eliminado exitosamente" };
    } catch (error) {
      console.error("Error en eliminarTipoCalificacion:", error);
      throw error;
    }
  },
};

module.exports = tipoCalificacionService;
