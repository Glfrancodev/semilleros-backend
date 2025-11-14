const db = require("../models");
const Feria = db.Feria;
const Proyecto = db.Proyecto;

const feriaService = {
  /**
   * Crear una nueva feria
   */
  async crearFeria(data) {
    try {
      const feria = await Feria.create({
        nombre: data.nombre,
        semestre: data.semestre,
        año: data.año,
        estaActivo: data.estaActivo !== undefined ? data.estaActivo : true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return feria;
    } catch (error) {
      console.error("Error en crearFeria:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las ferias
   */
  async obtenerFerias() {
    try {
      const ferias = await Feria.findAll({
        order: [
          ["año", "DESC"],
          ["semestre", "ASC"],
        ],
      });

      return ferias;
    } catch (error) {
      console.error("Error en obtenerFerias:", error);
      throw error;
    }
  },

  /**
   * Obtener una feria por ID
   */
  async obtenerFeriaPorId(idFeria) {
    try {
      const feria = await Feria.findByPk(idFeria, {
        include: [
          {
            model: Proyecto,
            as: "proyectos",
            attributes: ["idProyecto", "nombre"],
          },
        ],
      });

      if (!feria) {
        throw new Error("Feria no encontrada");
      }

      return feria;
    } catch (error) {
      console.error("Error en obtenerFeriaPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar una feria
   */
  async actualizarFeria(idFeria, data) {
    try {
      const feria = await Feria.findByPk(idFeria);

      if (!feria) {
        throw new Error("Feria no encontrada");
      }

      await feria.update({
        nombre: data.nombre || feria.nombre,
        semestre: data.semestre !== undefined ? data.semestre : feria.semestre,
        año: data.año || feria.año,
        estaActivo:
          data.estaActivo !== undefined ? data.estaActivo : feria.estaActivo,
        fechaActualizacion: new Date(),
      });

      return feria;
    } catch (error) {
      console.error("Error en actualizarFeria:", error);
      throw error;
    }
  },

  /**
   * Eliminar una feria
   */
  async eliminarFeria(idFeria) {
    try {
      const feria = await Feria.findByPk(idFeria);

      if (!feria) {
        throw new Error("Feria no encontrada");
      }

      await feria.destroy();

      return { mensaje: "Feria eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarFeria:", error);
      throw error;
    }
  },
};

module.exports = feriaService;
