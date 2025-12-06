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
   * Obtener una feria por ID (sin proyectos directos)
   */
  async obtenerFeriaPorId(idFeria) {
    try {
      const feria = await Feria.findByPk(idFeria);
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

  /**
   * Resumen de la feria activa
   */
  async obtenerResumenFeriaActiva() {
    try {
      // 1. Obtener la feria activa
      const feria = await db.Feria.findOne({
        where: { estaActivo: true },
        include: [
          {
            model: db.Tarea,
            as: "tareas",
            order: [["orden", "ASC"]],
          },
        ],
        order: [
          ["año", "DESC"],
          ["semestre", "DESC"],
        ],
      });
      if (!feria) throw new Error("No hay feria activa");

      // 2. Obtener todas las tareas de la feria
      const tareas = await db.Tarea.findAll({
        where: { idFeria: feria.idFeria },
        order: [["orden", "ASC"]],
      });

      // 3. Obtener todas las revisiones de la feria
      const revisiones = await db.Revision.findAll({
        include: [
          {
            model: db.Tarea,
            as: "tarea",
            where: { idFeria: feria.idFeria },
            attributes: ["idTarea", "orden"],
          },
          {
            model: db.Proyecto,
            as: "proyecto",
            attributes: ["idProyecto", "estaAprobado", "esFinal"],
          },
        ],
      });

      // 4. Calcular métricas
      // Proyectos inscritos: proyectos que tienen revisión de tarea 0
      const proyectosInscritos = new Set(
        revisiones.filter((r) => r.tarea.orden === 0).map((r) => r.idProyecto)
      );
      // Proyectos pendientes de aprobación
      const proyectosPendAprob = new Set(
        revisiones
          .filter(
            (r) => r.tarea.orden === 0 && r.proyecto.estaAprobado === null
          )
          .map((r) => r.idProyecto)
      );
      // Proyectos aprobados
      const proyectosAprobados = new Set(
        revisiones
          .filter(
            (r) => r.tarea.orden === 0 && r.proyecto.estaAprobado === true
          )
          .map((r) => r.idProyecto)
      );
      // Proyectos finales
      const proyectosFinales = new Set(
        revisiones
          .filter((r) => r.tarea.orden === 0 && r.proyecto.esFinal === true)
          .map((r) => r.idProyecto)
      );

      // 5. Métricas por tarea
      const tareasResumen = tareas.map((tarea) => {
        // Proyectos que han enviado revisión para esta tarea
        const revisionesTarea = revisiones.filter(
          (r) => r.tarea.idTarea === tarea.idTarea
        );
        const enviadosRevision = new Set(
          revisionesTarea.map((r) => r.idProyecto)
        );
        // Proyectos pendientes de revisión (revisado: false)
        const pendientesRevision = new Set(
          revisionesTarea
            .filter((r) => r.revisado === false)
            .map((r) => r.idProyecto)
        );
        return {
          idTarea: tarea.idTarea,
          orden: tarea.orden,
          nombre: tarea.nombre,
          descripcion: tarea.descripcion,
          fechaLimite: tarea.fechaLimite,
          enviadosRevision: enviadosRevision.size,
          pendientesRevision: pendientesRevision.size,
        };
      });

      // 6. Estructura de respuesta
      return {
        nombreFeria: feria.nombre,
        semestre: feria.semestre,
        año: feria.año,
        cantidadProyectosInscritos: proyectosInscritos.size,
        cantidadProyectosPendientesAprobacion: proyectosPendAprob.size,
        cantidadProyectosAprobados: proyectosAprobados.size,
        cantidadProyectosFinales: proyectosFinales.size,
        tareas: tareasResumen,
      };
    } catch (error) {
      console.error("Error en obtenerResumenFeriaActiva:", error);
      throw error;
    }
  },

  /**
   * Obtener la feria actualmente activa con estadísticas
   */
  async obtenerFeriaActiva() {
    try {
      const { QueryTypes } = require("sequelize");

      // Buscar la feria con estaActivo = true
      const feria = await Feria.findOne({
        where: { estaActivo: true },
        attributes: [
          "idFeria",
          "nombre",
          "semestre",
          "año",
          "estaActivo",
          "fechaCreacion",
          "fechaActualizacion",
        ],
      });

      if (!feria) {
        return null;
      }

      // Obtener estadísticas de proyectos relacionados a esta feria
      // Los proyectos están vinculados a través de: Proyecto -> GrupoMateria -> Materia -> Semestre -> Feria
      const [estadisticas] = await db.sequelize.query(
        `
        SELECT 
          COUNT(DISTINCT p."idProyecto") as "cantidadProyectosInscritos",
          COUNT(DISTINCT CASE WHEN p."estaAprobado" IS NULL THEN p."idProyecto" END) as "cantidadProyectosPendientesAprobacion",
          COUNT(DISTINCT CASE WHEN p."estaAprobado" = true THEN p."idProyecto" END) as "cantidadProyectosAprobados",
          COUNT(DISTINCT CASE WHEN p."esFinal" = true THEN p."idProyecto" END) as "cantidadProyectosFinales"
        FROM "Proyecto" p
        INNER JOIN "GrupoMateria" gm ON p."idGrupoMateria" = gm."idGrupoMateria"
        INNER JOIN "Materia" m ON gm."idMateria" = m."idMateria"
        INNER JOIN "Semestre" s ON m."idSemestre" = s."idSemestre"
        WHERE s."idFeria" = :idFeria
        `,
        {
          replacements: { idFeria: feria.idFeria },
          type: QueryTypes.SELECT,
        }
      );

      const feriaConEstadisticas = {
        ...feria.toJSON(),
        cantidadProyectosInscritos:
          parseInt(estadisticas.cantidadProyectosInscritos) || 0,
        cantidadProyectosPendientesAprobacion:
          parseInt(estadisticas.cantidadProyectosPendientesAprobacion) || 0,
        cantidadProyectosAprobados:
          parseInt(estadisticas.cantidadProyectosAprobados) || 0,
        cantidadProyectosFinales:
          parseInt(estadisticas.cantidadProyectosFinales) || 0,
      };

      return feriaConEstadisticas;
    } catch (error) {
      console.error("Error en obtenerFeriaActiva:", error);
      throw error;
    }
  },

  /**
   * Obtener todas las ferias que NO están activas (historial)
   */
  async obtenerFeriasPasadas() {
    try {
      const ferias = await Feria.findAll({
        where: { estaActivo: false },
        attributes: [
          "idFeria",
          "nombre",
          "semestre",
          "año",
          "estaActivo",
          "fechaCreacion",
          "fechaActualizacion",
        ],
        include: [
          {
            model: db.Tarea,
            as: "tareas",
            attributes: [
              "idTarea",
              "nombre",
              "descripcion",
              "fechaLimite",
              "orden",
            ],
            required: false,
          },
        ],
        order: [
          ["año", "DESC"],
          ["semestre", "DESC"],
          ["fechaCreacion", "DESC"],
        ],
      });

      return ferias;
    } catch (error) {
      console.error("Error en obtenerFeriasPasadas:", error);
      throw error;
    }
  },
};

module.exports = feriaService;
