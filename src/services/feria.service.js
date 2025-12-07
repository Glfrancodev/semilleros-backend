const db = require("../models");
const Feria = db.Feria;
const Proyecto = db.Proyecto;

const feriaService = {
  /**
   * Crear una nueva feria
   */
  async crearFeria(data) {
    const transaction = await db.sequelize.transaction();
    try {
      let idTipoCalificacionCreado = null;

      // 1. Validar y crear TipoCalificacion con SubCalificaciones si se proporciona
      if (data.tipoCalificacion) {
        const { nombre, subCalificaciones } = data.tipoCalificacion;

        // Validar que exista al menos una subcalificación
        if (
          !subCalificaciones ||
          !Array.isArray(subCalificaciones) ||
          subCalificaciones.length === 0
        ) {
          throw new Error(
            "El tipo de calificación debe tener al menos una subcalificación"
          );
        }

        // Validar que la suma de maximoPuntaje sea exactamente 100
        const sumaTotal = subCalificaciones.reduce(
          (sum, sub) => sum + (Number(sub.maximoPuntaje) || 0),
          0
        );

        if (sumaTotal !== 100) {
          throw new Error(
            `La suma de los puntajes máximos debe ser 100. Suma actual: ${sumaTotal}`
          );
        }

        // Validar que todos los puntajes sean positivos
        const puntajesInvalidos = subCalificaciones.filter(
          (sub) => !sub.maximoPuntaje || Number(sub.maximoPuntaje) <= 0
        );
        if (puntajesInvalidos.length > 0) {
          throw new Error(
            "Todas las subcalificaciones deben tener un puntaje máximo mayor a 0"
          );
        }

        // Crear el TipoCalificacion
        const tipoCalificacion = await db.TipoCalificacion.create(
          {
            nombre: nombre || "Criterios de Evaluación",
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
          },
          { transaction }
        );

        idTipoCalificacionCreado = tipoCalificacion.idTipoCalificacion;

        // Crear las SubCalificaciones
        const subCalificacionesData = subCalificaciones.map((sub) => ({
          nombre: sub.nombre,
          maximoPuntaje: Number(sub.maximoPuntaje),
          idTipoCalificacion: tipoCalificacion.idTipoCalificacion,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        }));

        await db.SubCalificacion.bulkCreate(subCalificacionesData, {
          transaction,
        });
      }

      // 2. Crear la feria
      const feria = await Feria.create(
        {
          nombre: data.nombre,
          semestre: data.semestre,
          año: data.año,
          estaActivo: data.estaActivo !== undefined ? data.estaActivo : true,
          idTipoCalificacion: idTipoCalificacionCreado,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      // 3. Crear las tareas asociadas si existen
      if (data.tareas && Array.isArray(data.tareas) && data.tareas.length > 0) {
        // VALIDACIÓN: Solo una tarea puede ser final
        const tareasFinal = data.tareas.filter((t) => t.esFinal === true);
        if (tareasFinal.length > 1) {
          throw new Error("Solo puede haber una tarea final por feria");
        }

        const tareasConFeria = data.tareas.map((tarea) => ({
          nombre: tarea.nombre,
          descripcion: tarea.descripcion,
          fechaLimite: tarea.fechaLimite,
          orden: tarea.orden !== undefined ? tarea.orden : 0,
          esFinal: tarea.esFinal !== undefined ? tarea.esFinal : false,
          idFeria: feria.idFeria,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        }));

        await db.Tarea.bulkCreate(tareasConFeria, { transaction });
      }

      await transaction.commit();

      // 4. Retornar la feria con sus tareas y tipo de calificación completo
      const feriaCompleta = await Feria.findByPk(feria.idFeria, {
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
              "esFinal",
            ],
          },
          {
            model: db.TipoCalificacion,
            as: "tipoCalificacion",
            attributes: ["idTipoCalificacion", "nombre"],
            include: [
              {
                model: db.SubCalificacion,
                as: "subCalificaciones",
                attributes: ["idSubCalificacion", "nombre", "maximoPuntaje"],
              },
            ],
          },
        ],
        order: [[{ model: db.Tarea, as: "tareas" }, "orden", "ASC"]],
      });

      return feriaCompleta;
    } catch (error) {
      await transaction.rollback();
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
              "esFinal",
            ],
          },
          {
            model: db.TipoCalificacion,
            as: "tipoCalificacion",
            attributes: ["idTipoCalificacion", "nombre"],
            include: [
              {
                model: db.SubCalificacion,
                as: "subCalificaciones",
                attributes: ["idSubCalificacion", "nombre", "maximoPuntaje"],
              },
            ],
          },
        ],
        order: [
          ["año", "DESC"],
          ["semestre", "ASC"],
          [{ model: db.Tarea, as: "tareas" }, "orden", "ASC"],
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
    const transaction = await db.sequelize.transaction();
    try {
      const feria = await Feria.findByPk(idFeria, { transaction });

      if (!feria) {
        await transaction.rollback();
        throw new Error("Feria no encontrada");
      }

      let nuevoIdTipoCalificacion = feria.idTipoCalificacion;

      // 1. Actualizar o crear TipoCalificacion si se proporciona
      if (data.tipoCalificacion) {
        const { nombre, subCalificaciones } = data.tipoCalificacion;

        // Validar que exista al menos una subcalificación
        if (
          !subCalificaciones ||
          !Array.isArray(subCalificaciones) ||
          subCalificaciones.length === 0
        ) {
          throw new Error(
            "El tipo de calificación debe tener al menos una subcalificación"
          );
        }

        // Validar que la suma de maximoPuntaje sea exactamente 100
        const sumaTotal = subCalificaciones.reduce(
          (sum, sub) => sum + (Number(sub.maximoPuntaje) || 0),
          0
        );

        if (sumaTotal !== 100) {
          throw new Error(
            `La suma de los puntajes máximos debe ser 100. Suma actual: ${sumaTotal}`
          );
        }

        // Validar que todos los puntajes sean positivos
        const puntajesInvalidos = subCalificaciones.filter(
          (sub) => !sub.maximoPuntaje || Number(sub.maximoPuntaje) <= 0
        );
        if (puntajesInvalidos.length > 0) {
          throw new Error(
            "Todas las subcalificaciones deben tener un puntaje máximo mayor a 0"
          );
        }

        // Si ya existe un TipoCalificacion, eliminar las subcalificaciones antiguas
        if (feria.idTipoCalificacion) {
          await db.SubCalificacion.destroy({
            where: { idTipoCalificacion: feria.idTipoCalificacion },
            transaction,
          });

          // Actualizar el tipo de calificación existente
          await db.TipoCalificacion.update(
            {
              nombre: nombre || "Criterios de Evaluación",
              fechaActualizacion: new Date(),
            },
            {
              where: { idTipoCalificacion: feria.idTipoCalificacion },
              transaction,
            }
          );

          nuevoIdTipoCalificacion = feria.idTipoCalificacion;
        } else {
          // Crear nuevo TipoCalificacion
          const tipoCalificacion = await db.TipoCalificacion.create(
            {
              nombre: nombre || "Criterios de Evaluación",
              fechaCreacion: new Date(),
              fechaActualizacion: new Date(),
            },
            { transaction }
          );

          nuevoIdTipoCalificacion = tipoCalificacion.idTipoCalificacion;
        }

        // Crear las nuevas SubCalificaciones
        const subCalificacionesData = subCalificaciones.map((sub) => ({
          nombre: sub.nombre,
          maximoPuntaje: Number(sub.maximoPuntaje),
          idTipoCalificacion: nuevoIdTipoCalificacion,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        }));

        await db.SubCalificacion.bulkCreate(subCalificacionesData, {
          transaction,
        });
      }

      // 2. Actualizar datos básicos de la feria
      await feria.update(
        {
          nombre: data.nombre || feria.nombre,
          semestre:
            data.semestre !== undefined ? data.semestre : feria.semestre,
          año: data.año || feria.año,
          estaActivo:
            data.estaActivo !== undefined ? data.estaActivo : feria.estaActivo,
          idTipoCalificacion: nuevoIdTipoCalificacion,
          fechaActualizacion: new Date(),
        },
        { transaction }
      );

      // 3. Actualizar Tareas si se proporcionan
      if (data.tareas && Array.isArray(data.tareas)) {
        const tareasActuales = await db.Tarea.findAll({
          where: { idFeria },
          transaction,
        });

        const mapTareasActuales = new Map(); // orden -> Tarea
        tareasActuales.forEach((t) => mapTareasActuales.set(t.orden, t));

        const ordenesNuevos = new Set(data.tareas.map((t) => t.orden));

        // VALIDACIÓN: Solo una tarea puede ser final
        const tareasFinal = data.tareas.filter((t) => t.esFinal === true);
        if (tareasFinal.length > 1) {
          throw new Error("Solo puede haber una tarea final por feria");
        }

        // Si hay una nueva tarea final, desmarcar todas las tareas actuales
        if (tareasFinal.length === 1) {
          await db.Tarea.update(
            { esFinal: false },
            { where: { idFeria }, transaction }
          );
        }

        // A. Identificar tareas a ELIMINAR (están en actuales pero no en nuevos)
        for (const [orden, tarea] of mapTareasActuales) {
          if (!ordenesNuevos.has(orden)) {
            if (orden === 0) {
              // PROTECCIÓN: No permitir eliminar tarea 0
              console.warn("Intento de eliminar tarea 0 bloqueado.");
              continue;
            }
            await tarea.destroy({ transaction });
          }
        }

        // B. Identificar tareas a CREAR o ACTUALIZAR
        for (const tareaData of data.tareas) {
          if (mapTareasActuales.has(tareaData.orden)) {
            // ACTUALIZAR
            const tareaExistente = mapTareasActuales.get(tareaData.orden);
            await tareaExistente.update(
              {
                nombre: tareaData.nombre,
                descripcion: tareaData.descripcion,
                fechaLimite: tareaData.fechaLimite,
                esFinal:
                  tareaData.esFinal !== undefined ? tareaData.esFinal : false,
                fechaActualizacion: new Date(),
              },
              { transaction }
            );
          } else {
            // CREAR
            await db.Tarea.create(
              {
                idFeria: idFeria,
                nombre: tareaData.nombre,
                descripcion: tareaData.descripcion,
                fechaLimite: tareaData.fechaLimite,
                orden: tareaData.orden,
                esFinal:
                  tareaData.esFinal !== undefined ? tareaData.esFinal : false,
                fechaCreacion: new Date(),
                fechaActualizacion: new Date(),
              },
              { transaction }
            );
          }
        }
      }

      await transaction.commit();
      return feria;
    } catch (error) {
      await transaction.rollback();
      console.error("Error en actualizarFeria:", error);
      throw error;
    }
  },

  /**
   * Eliminar una feria
   * Elimina en cascada: Revisiones → Tareas → SubCalificaciones → TipoCalificacion → Feria
   */
  async eliminarFeria(idFeria) {
    const transaction = await db.sequelize.transaction();
    try {
      const feria = await Feria.findByPk(idFeria, {
        include: [
          {
            model: db.Tarea,
            as: "tareas",
          },
        ],
        transaction,
      });

      if (!feria) {
        await transaction.rollback();
        throw new Error("Feria no encontrada");
      }

      const idTipoCalificacion = feria.idTipoCalificacion;

      // 1. Eliminar todas las revisiones de las tareas de esta feria
      if (feria.tareas && feria.tareas.length > 0) {
        const idsTareas = feria.tareas.map((t) => t.idTarea);

        await db.Revision.destroy({
          where: { idTarea: idsTareas },
          transaction,
        });

        console.log(`✅ Revisiones de las tareas eliminadas`);
      }

      // 2. Eliminar todas las tareas de la feria (CASCADE ya maneja esto, pero por si acaso)
      await db.Tarea.destroy({
        where: { idFeria },
        transaction,
      });

      console.log(`✅ Tareas de la feria eliminadas`);

      // 3. Eliminar la feria
      await feria.destroy({ transaction });

      console.log(`✅ Feria eliminada`);

      // 4. Eliminar el TipoCalificacion y sus SubCalificaciones si existe
      if (idTipoCalificacion) {
        // Primero eliminar subcalificaciones (CASCADE ya lo maneja, pero por claridad)
        await db.SubCalificacion.destroy({
          where: { idTipoCalificacion },
          transaction,
        });

        // Luego eliminar el tipo de calificación
        await db.TipoCalificacion.destroy({
          where: { idTipoCalificacion },
          transaction,
        });

        console.log(`✅ TipoCalificacion y SubCalificaciones eliminados`);
      }

      await transaction.commit();

      return {
        mensaje: "Feria eliminada exitosamente",
        detalles: {
          feriaEliminada: true,
          tareasEliminadas: feria.tareas?.length || 0,
          tipoCalificacionEliminado: !!idTipoCalificacion,
        },
      };
    } catch (error) {
      await transaction.rollback();
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

  /**
   * Finalizar una feria y calcular ganadores automáticamente
   * @param {string} idFeria - ID de la feria
   * @returns {Promise<Object>} - Feria actualizada con ganadores
   */
  async finalizarFeria(idFeria) {
    const transaction = await db.sequelize.transaction();
    try {
      // 1. Verificar que la feria existe
      const feria = await Feria.findByPk(idFeria);
      if (!feria) {
        throw new Error("Feria no encontrada");
      }

      if (feria.estaFinalizado) {
        throw new Error("La feria ya está finalizada");
      }

      // 2. Obtener todas las áreas y categorías
      const areas = await db.Area.findAll({
        include: [
          {
            model: db.AreaCategoria,
            as: "areaCategorias",
            include: [
              {
                model: db.Categoria,
                as: "categoria",
                attributes: ["idCategoria", "nombre"],
              },
            ],
          },
        ],
      });

      // 3. Obtener todos los proyectos de la feria con sus calificaciones
      const proyectos = await Proyecto.findAll({
        include: [
          {
            model: db.Revision,
            as: "revisiones",
            required: true,
            include: [
              {
                model: db.Tarea,
                as: "tarea",
                required: true,
                where: { idFeria },
              },
            ],
          },
          {
            model: db.DocenteProyecto,
            as: "docentesProyecto",
            required: false,
            include: [
              {
                model: db.Calificacion,
                as: "calificaciones",
                where: { calificado: true },
                required: false,
              },
            ],
          },
          {
            model: db.EstudianteProyecto,
            as: "estudiantesProyecto",
            required: false,
            include: [
              {
                model: db.Estudiante,
                as: "estudiante",
                attributes: ["idEstudiante"],
                include: [
                  {
                    model: db.Usuario,
                    as: "usuario",
                    attributes: ["nombre", "apellido"],
                  },
                ],
              },
            ],
          },
          {
            model: db.GrupoMateria,
            as: "grupoMateria",
            required: true,
            include: [
              {
                model: db.Materia,
                as: "materia",
                include: [
                  {
                    model: db.AreaCategoria,
                    as: "areaCategoria",
                    include: [
                      {
                        model: db.Area,
                        as: "area",
                        attributes: ["idArea", "nombre"],
                      },
                      {
                        model: db.Categoria,
                        as: "categoria",
                        attributes: ["idCategoria", "nombre"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      // 4. Calcular nota promedio para cada proyecto
      const proyectosConNota = proyectos
        .map((proyecto) => {
          const jurados = proyecto.docentesProyecto || [];
          const notasJurados = [];

          for (const jurado of jurados) {
            if (jurado.calificaciones && jurado.calificaciones.length > 0) {
              const totalPuntaje = jurado.calificaciones.reduce(
                (sum, cal) => sum + cal.puntajeObtenido,
                0
              );
              notasJurados.push(totalPuntaje);
            }
          }

          let notaPromedio = null;
          if (notasJurados.length > 0) {
            notaPromedio =
              notasJurados.reduce((sum, nota) => sum + nota, 0) /
              notasJurados.length;
            notaPromedio = Math.round(notaPromedio * 100) / 100;
          }

          // Extraer área y categoría del proyecto
          const areaCategoria =
            proyecto.grupoMateria?.materia?.areaCategoria || null;
          const area = areaCategoria?.area || null;
          const categoria = areaCategoria?.categoria || null;

          // Extraer integrantes
          const integrantes = (proyecto.estudiantesProyecto || []).map(
            (ep) => ({
              idEstudiante: ep.estudiante?.idEstudiante || null,
              nombreCompleto: ep.estudiante?.usuario
                ? `${ep.estudiante.usuario.nombre} ${ep.estudiante.usuario.apellido}`
                : "Sin nombre",
            })
          );

          return {
            idProyecto: proyecto.idProyecto,
            nombreProyecto: proyecto.nombre,
            notaPromedio,
            area,
            categoria,
            integrantes,
          };
        })
        .filter((p) => p.notaPromedio !== null && p.area && p.categoria); // Solo proyectos con nota y área/categoría

      // 5. Organizar ganadores por área y categoría
      const ganadores = {};

      areas.forEach((area) => {
        const nombreArea = area.nombre;
        ganadores[nombreArea] = {};

        area.areaCategorias.forEach((ac) => {
          const categoria = ac.categoria;
          const nombreCategoria = categoria.nombre;

          // Filtrar proyectos de esta área-categoría
          const proyectosDeCategoria = proyectosConNota.filter(
            (p) =>
              p.area.idArea === area.idArea &&
              p.categoria.idCategoria === categoria.idCategoria
          );

          // Ordenar por nota promedio descendente
          proyectosDeCategoria.sort((a, b) => b.notaPromedio - a.notaPromedio);

          // Tomar los 3 primeros lugares
          const primerLugar = proyectosDeCategoria[0] || null;
          const segundoLugar = proyectosDeCategoria[1] || null;
          const tercerLugar = proyectosDeCategoria[2] || null;

          ganadores[nombreArea][nombreCategoria] = {
            primerLugar: primerLugar
              ? {
                  proyecto: {
                    idProyecto: primerLugar.idProyecto,
                    nombreProyecto: primerLugar.nombreProyecto,
                    notaPromedio: primerLugar.notaPromedio,
                    integrantes: primerLugar.integrantes,
                  },
                }
              : null,
            segundoLugar: segundoLugar
              ? {
                  proyecto: {
                    idProyecto: segundoLugar.idProyecto,
                    nombreProyecto: segundoLugar.nombreProyecto,
                    notaPromedio: segundoLugar.notaPromedio,
                    integrantes: segundoLugar.integrantes,
                  },
                }
              : null,
            tercerLugar: tercerLugar
              ? {
                  proyecto: {
                    idProyecto: tercerLugar.idProyecto,
                    nombreProyecto: tercerLugar.nombreProyecto,
                    notaPromedio: tercerLugar.notaPromedio,
                    integrantes: tercerLugar.integrantes,
                  },
                }
              : null,
          };
        });
      });

      // 6. Actualizar la feria
      feria.estaFinalizado = true;
      feria.ganadores = ganadores;
      feria.fechaActualizacion = new Date();
      await feria.save({ transaction });

      await transaction.commit();

      return {
        idFeria: feria.idFeria,
        nombre: feria.nombre,
        estaFinalizado: feria.estaFinalizado,
        ganadores: feria.ganadores,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("Error en finalizarFeria:", error);
      throw error;
    }
  },
};

module.exports = feriaService;
