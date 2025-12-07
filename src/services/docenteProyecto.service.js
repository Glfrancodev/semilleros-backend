const db = require("../models");
const DocenteProyecto = db.DocenteProyecto;
const Docente = db.Docente;
const Proyecto = db.Proyecto;
const Calificacion = db.Calificacion;
const Materia = db.Materia;
const Feria = db.Feria;
const TipoCalificacion = db.TipoCalificacion;
const SubCalificacion = db.SubCalificacion;
const sequelize = db.sequelize;

const docenteProyectoService = {
  /**
   * Asignar un docente a un proyecto
   */
  async asignarDocenteAProyecto(data) {
    const transaction = await sequelize.transaction();

    try {
      // Crear la asignación DocenteProyecto
      const docenteProyecto = await DocenteProyecto.create(
        {
          idDocente: data.idDocente,
          idProyecto: data.idProyecto,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      // Obtener el proyecto con revisiones -> tarea -> feria -> tipocalificacion -> subcalificaciones
      const proyecto = await Proyecto.findByPk(data.idProyecto, {
        include: [
          {
            model: db.Revision,
            as: "revisiones",
            include: [
              {
                model: db.Tarea,
                as: "tarea",
                include: [
                  {
                    model: Feria,
                    as: "feria",
                    include: [
                      {
                        model: TipoCalificacion,
                        as: "tipoCalificacion",
                        include: [
                          {
                            model: SubCalificacion,
                            as: "subCalificaciones",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        transaction,
      });

      // Verificar que el proyecto tenga revisiones y obtener la feria
      let feria = null;
      if (proyecto && proyecto.revisiones && proyecto.revisiones.length > 0) {
        // Obtener la feria de la primera revisión
        const primeraRevision = proyecto.revisiones[0];
        if (primeraRevision.tarea && primeraRevision.tarea.feria) {
          feria = primeraRevision.tarea.feria;
        }
      }

      console.log("🔍 Debug - Feria:", JSON.stringify(feria, null, 2));

      // Si hay feria con tipo de calificación, obtener las subcalificaciones con un query separado
      if (feria && feria.idTipoCalificacion) {
        // Query separado para obtener TODAS las subcalificaciones (evita problemas con includes profundos)
        const subCalificaciones = await SubCalificacion.findAll({
          where: { idTipoCalificacion: feria.idTipoCalificacion },
          transaction,
        });

        console.log(
          "🔍 Debug - SubCalificaciones obtenidas:",
          subCalificaciones.length
        );
        console.log(
          "🔍 Debug - SubCalificaciones:",
          JSON.stringify(subCalificaciones, null, 2)
        );

        if (subCalificaciones && subCalificaciones.length > 0) {
          // Crear una calificación por cada subCalificación
          const calificaciones = subCalificaciones.map((subCal) => ({
            idDocenteProyecto: docenteProyecto.idDocenteProyecto,
            idSubCalificacion: subCal.idSubCalificacion,
            puntajeObtenido: 0,
            calificado: false,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
          }));

          console.log(
            "🔍 Debug - Calificaciones a crear:",
            JSON.stringify(calificaciones, null, 2)
          );

          await Calificacion.bulkCreate(calificaciones, { transaction });

          console.log(
            `✅ Se crearon ${calificaciones.length} calificaciones para DocenteProyecto ${docenteProyecto.idDocenteProyecto}`
          );
        } else {
          console.log(
            `⚠️ El proyecto ${data.idProyecto} no tiene subcalificaciones configuradas. No se crearon calificaciones.`
          );
        }
      } else {
        console.log(
          `⚠️ El proyecto ${data.idProyecto} no tiene una feria con tipo de calificación configurado. No se crearon calificaciones.`
        );
      }

      await transaction.commit();
      return docenteProyecto;
    } catch (error) {
      await transaction.rollback();
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
          {
            model: Calificacion,
            as: "calificaciones",
            required: false,
            attributes: ["calificado"],
          },
        ],
      });

      // Formatear la respuesta
      return proyectos.map((dp) => {
        // Verificar si todas las calificaciones están completas
        const tieneCalificaciones =
          dp.calificaciones && dp.calificaciones.length > 0;
        const estaCalificado = tieneCalificaciones
          ? dp.calificaciones.every((cal) => cal.calificado === true)
          : false;

        return {
          idProyecto: dp.proyecto.idProyecto,
          idDocenteProyecto: dp.idDocenteProyecto,
          nombre: dp.proyecto.nombre,
          descripcion: dp.proyecto.descripcion,
          estaCalificado,
        };
      });
    } catch (error) {
      console.error("Error en obtenerMisProyectosComoJurado:", error);
      throw error;
    }
  },
};

module.exports = docenteProyectoService;
