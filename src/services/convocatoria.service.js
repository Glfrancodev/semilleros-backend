const db = require("../models");
const Convocatoria = db.Convocatoria;
const Proyecto = db.Proyecto;

const convocatoriaService = {
  /**
   * Crear una nueva convocatoria
   */
  async crearConvocatoria(data) {
    try {
      const convocatoria = await Convocatoria.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        semestre: data.semestre,
        año: data.año,
        estaActivo: data.estaActivo !== undefined ? data.estaActivo : true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return convocatoria;
    } catch (error) {
      console.error("Error en crearConvocatoria:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las convocatorias
   */
  async obtenerConvocatorias() {
    try {
      const convocatorias = await Convocatoria.findAll({
        order: [
          ["año", "DESC"],
          ["semestre", "ASC"],
        ],
      });

      return convocatorias;
    } catch (error) {
      console.error("Error en obtenerConvocatorias:", error);
      throw error;
    }
  },

  /**
   * Obtener una convocatoria por ID
   */
  async obtenerConvocatoriaPorId(idConvocatoria) {
    try {
      const convocatoria = await Convocatoria.findByPk(idConvocatoria, {
        include: [
          {
            model: Proyecto,
            as: "proyectos",
            attributes: ["idProyecto", "nombre"],
          },
        ],
      });

      if (!convocatoria) {
        throw new Error("Convocatoria no encontrada");
      }

      return convocatoria;
    } catch (error) {
      console.error("Error en obtenerConvocatoriaPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar una convocatoria
   */
  async actualizarConvocatoria(idConvocatoria, data) {
    try {
      const convocatoria = await Convocatoria.findByPk(idConvocatoria);

      if (!convocatoria) {
        throw new Error("Convocatoria no encontrada");
      }

      await convocatoria.update({
        nombre: data.nombre || convocatoria.nombre,
        descripcion:
          data.descripcion !== undefined
            ? data.descripcion
            : convocatoria.descripcion,
        semestre:
          data.semestre !== undefined ? data.semestre : convocatoria.semestre,
        año: data.año || convocatoria.año,
        estaActivo:
          data.estaActivo !== undefined
            ? data.estaActivo
            : convocatoria.estaActivo,
        fechaActualizacion: new Date(),
      });

      return convocatoria;
    } catch (error) {
      console.error("Error en actualizarConvocatoria:", error);
      throw error;
    }
  },

  /**
   * Eliminar una convocatoria
   */
  async eliminarConvocatoria(idConvocatoria) {
    try {
      const convocatoria = await Convocatoria.findByPk(idConvocatoria);

      if (!convocatoria) {
        throw new Error("Convocatoria no encontrada");
      }

      await convocatoria.destroy();

      return { mensaje: "Convocatoria eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarConvocatoria:", error);
      throw error;
    }
  },
};

module.exports = convocatoriaService;
