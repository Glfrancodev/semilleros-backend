const db = require("../models");
const Tarea = db.Tarea;
const Revision = db.Revision;
const Feria = db.Feria;
const Administrativo = db.Administrativo;
const Usuario = db.Usuario;

const tareaService = {
  /**
   * Crear una nueva tarea
   */
  async crearTarea(data) {
    try {
      const tarea = await Tarea.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        fechaLimite: data.fechaLimite,
        orden: data.orden !== undefined ? data.orden : 0,
        esFinal: data.esFinal !== undefined ? data.esFinal : false,
        idFeria: data.idFeria,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: data.creadoPor,
        actualizadoPor: data.actualizadoPor,
      });

      return tarea;
    } catch (error) {
      console.error("Error en crearTarea:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las tareas
   */
  async obtenerTareas() {
    try {
      const tareas = await Tarea.findAll({
        include: [
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
        order: [["fechaLimite", "ASC"]],
      });

      return tareas;
    } catch (error) {
      console.error("Error en obtenerTareas:", error);
      throw error;
    }
  },

  /**
   * Obtener tareas con orden 0 de ferias activas
   */
  async obtenerTareasOrdenCero() {
    try {
      const tareas = await Tarea.findAll({
        where: { orden: 0 },
        include: [
          {
            model: db.Feria,
            as: "feria",
            attributes: ["idFeria", "nombre", "semestre", "año", "estado"],
            where: { estado: "Activo" }, // Solo ferias activas
          },
        ],
        order: [["fechaLimite", "ASC"]],
      });

      return tareas;
    } catch (error) {
      console.error("Error en obtenerTareasOrdenCero:", error);
      throw error;
    }
  },

  /**
   * Obtener tareas por feria
   */
  async obtenerTareasPorFeria(idFeria) {
    try {
      const tareas = await Tarea.findAll({
        where: { idFeria },
        include: [
          {
            model: Feria,
            as: "feria",
            attributes: [
              "idFeria",
              "nombre",
              "descripcion",
              "semestre",
              "año",
              "estado",
            ],
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
        order: [["orden", "ASC"]],
      });

      return tareas;
    } catch (error) {
      console.error("Error en obtenerTareasPorFeria:", error);
      throw error;
    }
  },

  /**
   * Obtener una tarea por ID
   */
  async obtenerTareaPorId(idTarea) {
    try {
      const tarea = await Tarea.findByPk(idTarea, {
        include: [
          {
            model: Revision,
            as: "revisiones",
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

      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      return tarea;
    } catch (error) {
      console.error("Error en obtenerTareaPorId:", error);
      throw error;
    }
  },

  /**
   * Obtener detalle completo de una tarea
   */
  async obtenerDetalleTarea(idTarea) {
    try {
      // Obtener la tarea con su feria
      const tarea = await Tarea.findByPk(idTarea, {
        include: [
          {
            model: Feria,
            as: "feria",
            attributes: ["idFeria", "nombre", "semestre", "año"],
          },
        ],
      });
      if (!tarea) throw new Error("Tarea no encontrada");

      // Obtener revisiones de la tarea con proyecto
      const revisiones = await Revision.findAll({
        where: { idTarea },
        include: [
          {
            model: db.Proyecto,
            as: "proyecto",
            attributes: ["idProyecto", "nombre", "descripcion"],
          },
          {
            model: db.Estudiante,
            as: "autor",
            attributes: ["idEstudiante", "codigoEstudiante"],
            include: [
              {
                model: db.Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido"],
              },
            ],
          },
          {
            model: db.Administrativo,
            as: "revisor",
            attributes: ["idAdministrativo", "codigoAdministrativo"],
            include: [
              {
                model: db.Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido"],
              },
            ],
          },
        ],
        order: [["fechaCreacion", "ASC"]],
      });

      // Revisiones enviadas
      const revisionesEnviadas = revisiones.length;
      // Revisiones pendientes de revisión
      const revisionesPendientes = revisiones.filter(
        (r) => r.revisado === false
      ).length;

      // Lista de proyectos que enviaron revisión
      const proyectos = revisiones.map((r) => ({
        idProyecto: r.proyecto?.idProyecto,
        nombre: r.proyecto?.nombre,
        descripcion: r.proyecto?.descripcion,
        fechaEnvio: r.fechaCreacion,
        revisado: r.revisado,
        enviadoPor: r.autor
          ? {
              nombre: r.autor.usuario?.nombre,
              apellido: r.autor.usuario?.apellido,
              codigoEstudiante: r.autor.codigoEstudiante,
            }
          : null,
        revisadoPor: r.revisor
          ? {
              nombre: r.revisor.usuario?.nombre,
              apellido: r.revisor.usuario?.apellido,
              codigoAdministrativo: r.revisor.codigoAdministrativo,
            }
          : null,
      }));

      return {
        idTarea: tarea.idTarea,
        orden: tarea.orden,
        nombre: tarea.nombre,
        descripcion: tarea.descripcion,
        fechaLimite: tarea.fechaLimite,
        idFeria: tarea.idFeria,
        revisionesEnviadas,
        revisionesPendientes,
        proyectos,
      };
    } catch (error) {
      console.error("Error en obtenerDetalleTarea:", error);
      throw error;
    }
  },

  /**
   * Actualizar una tarea
   */
  async actualizarTarea(idTarea, data) {
    try {
      const tarea = await Tarea.findByPk(idTarea);

      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      await tarea.update({
        nombre: data.nombre || tarea.nombre,
        descripcion:
          data.descripcion !== undefined ? data.descripcion : tarea.descripcion,
        fechaLimite: data.fechaLimite || tarea.fechaLimite,
        orden: data.orden !== undefined ? data.orden : tarea.orden,
        esFinal: data.esFinal !== undefined ? data.esFinal : tarea.esFinal,
        idFeria: data.idFeria || tarea.idFeria,
        fechaActualizacion: new Date(),
        actualizadoPor: data.actualizadoPor,
      });

      return tarea;
    } catch (error) {
      console.error("Error en actualizarTarea:", error);
      throw error;
    }
  },

  /**
   * Eliminar una tarea
   */
  async eliminarTarea(idTarea) {
    try {
      const tarea = await Tarea.findByPk(idTarea);

      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      await tarea.destroy();

      return { mensaje: "Tarea eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarTarea:", error);
      throw error;
    }
  },
};

module.exports = tareaService;
