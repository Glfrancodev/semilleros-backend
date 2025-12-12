const db = require("../models");
const Revision = db.Revision;
const Proyecto = db.Proyecto;
const Estudiante = db.Estudiante;
const Administrativo = db.Administrativo;
const Usuario = db.Usuario;

const revisionService = {
  /**
   * Crear una nueva revisión
   */
  async crearRevision(data) {
    try {
      const revision = await Revision.create({
        puntaje: data.puntaje || null,
        comentario: data.comentario || null,
        idProyecto: data.idProyecto,
        idTarea: data.idTarea,
        fechaCreacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        enviadoPor: data.enviadoPor, // Estudiante
      });

      return revision;
    } catch (error) {
      console.error("Error en crearRevision:", error);
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
            as: "proyecto",
            attributes: ["idProyecto", "nombre"],
          },
          {
            model: db.Archivo,
            as: "archivos",
            attributes: ["idArchivo", "nombre", "formato", "tamano"],
          },
          {
            model: Estudiante,
            as: "autor",
            attributes: ["idEstudiante", "codigoEstudiante"],
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
            as: "revisor",
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
        order: [["fechaCreacion", "DESC"]],
      });

      return revisiones;
    } catch (error) {
      console.error("Error en obtenerRevisiones:", error);
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
            as: "proyecto",
          },
          {
            model: db.Archivo,
            as: "archivos",
          },
          {
            model: Estudiante,
            as: "autor",
            attributes: ["idEstudiante", "codigoEstudiante"],
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
            as: "revisor",
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

      if (!revision) {
        throw new Error("Revisión no encontrada");
      }

      return revision;
    } catch (error) {
      console.error("Error en obtenerRevisionPorId:", error);
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
        include: [
          {
            model: db.Tarea,
            as: "tarea",
            include: [
              {
                model: db.Feria,
                as: "feria",
              },
            ],
          },
          {
            model: Estudiante,
            as: "autor",
            attributes: ["idEstudiante", "codigoEstudiante"],
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
            as: "revisor",
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
        order: [["fechaCreacion", "DESC"]],
      });

      return revisiones;
    } catch (error) {
      console.error("Error en obtenerRevisionesPorProyecto:", error);
      throw error;
    }
  },

  /**
   * Actualizar una revisión
   */
  async actualizarRevision(idRevision, data) {
    try {
      const revision = await Revision.findByPk(idRevision, {
        include: [
          {
            model: db.Tarea,
            as: "tarea",
            attributes: ["idTarea", "orden"],
          },
        ],
      });

      if (!revision) {
        throw new Error("Revisión no encontrada");
      }

      await revision.update({
        puntaje: data.puntaje !== undefined ? data.puntaje : revision.puntaje,
        comentario:
          data.comentario !== undefined ? data.comentario : revision.comentario,
        revisado:
          data.revisado !== undefined ? data.revisado : revision.revisado,
        fechaActualizacion: new Date(),
        revisadoPor: data.revisadoPor, // Administrativo
      });

      // Si es la tarea 0 (inscripción) y se asignó un puntaje, actualizar estaAprobado del proyecto
      if (
        revision.tarea &&
        revision.tarea.orden === 0 &&
        data.puntaje !== undefined
      ) {
        const proyecto = await Proyecto.findByPk(revision.idProyecto);
        if (proyecto) {
          // Aprobar si el puntaje es mayor a 0, rechazar si es 0
          const estaAprobado = data.puntaje > 0;
          await proyecto.update({
            estaAprobado: estaAprobado,
            fechaActualizacion: new Date(),
          });
          console.log(
            `Proyecto ${proyecto.idProyecto} actualizado: estaAprobado = ${estaAprobado} (puntaje tarea 0: ${data.puntaje})`
          );
        }
      }

      return revision;
    } catch (error) {
      console.error("Error en actualizarRevision:", error);
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
        throw new Error("Revisión no encontrada");
      }

      await revision.destroy();

      return { mensaje: "Revisión eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarRevision:", error);
      throw error;
    }
  },
};

module.exports = revisionService;
