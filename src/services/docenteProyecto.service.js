const db = require("../models");
const DocenteProyecto = db.DocenteProyecto;
const Docente = db.Docente;
const Proyecto = db.Proyecto;
const Calificacion = db.Calificacion;

const docenteProyectoService = {
  /**
   * Asignar un docente a un proyecto
   */
  async asignarDocenteAProyecto(data) {
    try {
      const docenteProyecto = await DocenteProyecto.create({
        idDocente: data.idDocente,
        idProyecto: data.idProyecto,
        esTutor: data.esTutor || false,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      return docenteProyecto;
    } catch (error) {
      console.error("Error en asignarDocenteAProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las asignaciones
   */
  async obtenerAsignaciones() {
    try {
      const asignaciones = await DocenteProyecto.findAll({
        include: [
          {
            model: Docente,
            as: "docente",
          },
          {
            model: Proyecto,
            as: "proyecto",
          },
          {
            model: Calificacion,
            as: "calificaciones",
          },
        ],
        order: [["fechaCreacion", "DESC"]],
      });

      return asignaciones;
    } catch (error) {
      console.error("Error en obtenerAsignaciones:", error);
      throw error;
    }
  },

  /**
   * Obtener docentes de un proyecto
   */
  async obtenerDocentesPorProyecto(idProyecto) {
    try {
      const db = require("../models");
      const { Usuario } = db;

      const docentes = await DocenteProyecto.findAll({
        where: { idProyecto },
        include: [
          {
            model: Docente,
            as: "docente",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["idUsuario", "nombre", "apellido", "correo"],
              },
            ],
          },
        ],
      });

      return docentes;
    } catch (error) {
      console.error("Error en obtenerDocentesPorProyecto:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos de un docente
   */
  async obtenerProyectosPorDocente(idDocente) {
    try {
      const proyectos = await DocenteProyecto.findAll({
        where: { idDocente },
        include: [
          {
            model: Proyecto,
            as: "proyecto",
          },
        ],
      });

      return proyectos;
    } catch (error) {
      console.error("Error en obtenerProyectosPorDocente:", error);
      throw error;
    }
  },

  /**
   * Obtener una asignación por ID
   */
  async obtenerAsignacionPorId(idDocenteProyecto) {
    try {
      const asignacion = await DocenteProyecto.findByPk(idDocenteProyecto, {
        include: [
          {
            model: Docente,
            as: "docente",
          },
          {
            model: Proyecto,
            as: "proyecto",
          },
          {
            model: Calificacion,
            as: "calificaciones",
          },
        ],
      });

      if (!asignacion) {
        throw new Error("Asignación no encontrada");
      }

      return asignacion;
    } catch (error) {
      console.error("Error en obtenerAsignacionPorId:", error);
      throw error;
    }
  },

  /**
   * Actualizar asignación (cambiar si es tutor)
   */
  async actualizarAsignacion(idDocenteProyecto, data) {
    try {
      const asignacion = await DocenteProyecto.findByPk(idDocenteProyecto);

      if (!asignacion) {
        throw new Error("Asignación no encontrada");
      }

      await asignacion.update({
        esTutor: data.esTutor !== undefined ? data.esTutor : asignacion.esTutor,
        fechaActualizacion: new Date(),
      });

      return asignacion;
    } catch (error) {
      console.error("Error en actualizarAsignacion:", error);
      throw error;
    }
  },

  /**
   * Eliminar asignación
   */
  async eliminarAsignacion(idDocenteProyecto) {
    try {
      const asignacion = await DocenteProyecto.findByPk(idDocenteProyecto);

      if (!asignacion) {
        throw new Error("Asignación no encontrada");
      }

      await asignacion.destroy();

      return { mensaje: "Docente removido del proyecto exitosamente" };
    } catch (error) {
      console.error("Error en eliminarAsignacion:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos donde el docente es jurado
   */
  async obtenerMisProyectosComoJurado(idUsuario) {
    try {
      const db = require("../models");
      const { Usuario, sequelize } = db;

      // Buscar el docente por idUsuario
      const docente = await Docente.findOne({
        where: { idUsuario },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["idUsuario", "nombre", "apellido"],
          },
        ],
      });

      if (!docente) {
        throw new Error("Docente no encontrado");
      }

      // Buscar la feria activa
      const feriaActiva = await db.Feria.findOne({
        where: { estaActivo: true },
      });

      if (!feriaActiva) {
        // Si no hay feria activa, retornar array vacío
        return [];
      }

      // Obtener proyectos donde:
      // 1. Soy jurado (DocenteProyecto con mi idDocente)
      // 2. El proyecto está en la feria activa (a través de Revision → Tarea → Feria)
      // 3. El proyecto está aprobado para feria (esFinal = true)
      const proyectos = await DocenteProyecto.findAll({
        where: { idDocente: docente.idDocente },
        include: [
          {
            model: Proyecto,
            as: "proyecto",
            required: true,
            where: {
              esFinal: true,
            },
            attributes: ["idProyecto", "nombre", "descripcion"],
            include: [
              {
                model: db.Revision,
                as: "revisiones",
                required: true,
                attributes: [],
                include: [
                  {
                    model: db.Tarea,
                    as: "tarea",
                    required: true,
                    attributes: [],
                    where: {
                      idFeria: feriaActiva.idFeria,
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      // Formatear la respuesta
      return proyectos.map((dp) => ({
        idProyecto: dp.proyecto.idProyecto,
        nombre: dp.proyecto.nombre,
        descripcion: dp.proyecto.descripcion,
      }));
    } catch (error) {
      console.error("Error en obtenerMisProyectosComoJurado:", error);
      throw error;
    }
  },
};

module.exports = docenteProyectoService;
