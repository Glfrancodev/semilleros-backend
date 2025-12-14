const {
  Feria,
  Tarea,
  Proyecto,
  Revision,
  GrupoMateria,
  Materia,
  AreaCategoria,
  Area,
  Categoria,
  Semestre,
  Docente,
  DocenteProyecto,
  Estudiante,
  EstudianteProyecto,
  EstudianteEvento,
  Evento,
  Calificacion,
  SubCalificacion,
  Usuario,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtener la feria activa actual
 * Solo puede haber una feria con estado 'Activo' a la vez
 */
const getFeriaActual = async () => {
  const feria = await Feria.findOne({
    where: { estado: "Activo" },
    order: [["fechaCreacion", "DESC"]],
    include: [
      {
        model: SubCalificacion,
        as: "tipoCalificacion",
        attributes: ["idTipoCalificacion", "nombre"],
      },
    ],
  });

  if (!feria) {
    throw new Error("No hay una feria activa en este momento");
  }

  return feria;
};

/**
 * Obtener la Tarea 0 (Inscripción) de una feria
 */
const getTarea0 = async (idFeria) => {
  const tarea = await Tarea.findOne({
    where: {
      idFeria,
      orden: 0, // Tarea 0 = Inscripción
    },
  });

  if (!tarea) {
    throw new Error("No se encontró la tarea de inscripción para esta feria");
  }

  return tarea;
};

/**
 * Construir query base para obtener proyectos de la feria actual con filtros
 */
const buildProyectosFeriaQuery = async (filtros = {}) => {
  const feriaActual = await getFeriaActual();
  const tarea0 = await getTarea0(feriaActual.idFeria);

  // Construir where clause para GrupoMateria -> Materia -> AreaCategoria
  const whereMateria = {};
  const whereAreaCategoria = {};

  if (filtros.semestreId) {
    whereMateria.idSemestre = filtros.semestreId;
  }

  if (filtros.materiaId) {
    whereMateria.idMateria = filtros.materiaId;
  }

  if (filtros.areaId || filtros.categoriaId) {
    if (filtros.areaId) whereAreaCategoria.idArea = filtros.areaId;
    if (filtros.categoriaId)
      whereAreaCategoria.idCategoria = filtros.categoriaId;
  }

  // Query base
  const queryOptions = {
    include: [
      {
        model: Revision,
        as: "revisiones",
        required: true,
        include: [
          {
            model: Tarea,
            as: "tarea",
            required: true,
            where: {
              idTarea: tarea0.idTarea,
            },
          },
        ],
      },
      {
        model: GrupoMateria,
        as: "grupoMateria",
        required: true,
        where: filtros.grupoMateriaId
          ? { idGrupoMateria: filtros.grupoMateriaId }
          : {},
        include: [
          {
            model: Materia,
            as: "materia",
            required: true,
            where: whereMateria,
            include: [
              {
                model: AreaCategoria,
                as: "areaCategoria",
                required: true,
                where: whereAreaCategoria,
                include: [
                  { model: Area, as: "area" },
                  { model: Categoria, as: "categoria" },
                ],
              },
              {
                model: Semestre,
                as: "semestre",
              },
            ],
          },
          {
            model: Docente,
            as: "docente", // Este es el TUTOR
            include: [
              {
                model: Usuario,
                as: "usuario",
              },
            ],
          },
        ],
      },
    ],
    distinct: true, // Evitar duplicados
  };

  return { queryOptions, feriaActual };
};

/**
 * Formatear filtros para respuesta
 */
const formatFiltros = (filtros) => {
  return {
    areaId: filtros.areaId || null,
    categoriaId: filtros.categoriaId || null,
    grupoMateriaId: filtros.grupoMateriaId || null,
    materiaId: filtros.materiaId || null,
    semestreId: filtros.semestreId || null,
  };
};

/**
 * Formatear información de feria para respuesta
 */
const formatFeriaInfo = (feria) => {
  return {
    idFeria: feria.idFeria,
    nombre: feria.nombre,
    semestre: feria.semestre,
    año: feria.año,
    estado: feria.estado,
  };
};

// ============================================
// ENDPOINTS DE KPIs
// ============================================

/**
 * KPI 1: Total de proyectos inscritos
 */
const getProyectosInscritos = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  const total = await Proyecto.count(queryOptions);

  return {
    total,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * KPI 2: Total de estudiantes participantes
 */
const getEstudiantesParticipantes = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  // Obtener proyectos de la feria
  const proyectos = await Proyecto.findAll(queryOptions);
  const idsProyectos = proyectos.map((p) => p.idProyecto);

  // Contar estudiantes únicos en esos proyectos
  const totalUnicos = await EstudianteProyecto.count({
    where: { idProyecto: { [Op.in]: idsProyectos } },
    distinct: true,
    col: "idEstudiante",
  });

  return {
    total: totalUnicos,
    totalUnicos,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * KPI 3: Total de tutores
 * Los tutores son los docentes del GrupoMateria de cada proyecto
 */
const getTutores = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  // Obtener proyectos con sus grupos
  const proyectos = await Proyecto.findAll(queryOptions);

  // Extraer IDs únicos de docentes (tutores)
  const idsDocentes = [
    ...new Set(
      proyectos
        .map((p) => p.grupoMateria?.idDocente)
        .filter((id) => id !== null && id !== undefined)
    ),
  ];

  const totalUnicos = idsDocentes.length;

  return {
    total: totalUnicos,
    totalUnicos,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * KPI 4: Total de jurados
 * Los jurados son los docentes en DocenteProyecto
 */
const getJurados = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  // Obtener proyectos de la feria
  const proyectos = await Proyecto.findAll(queryOptions);
  const idsProyectos = proyectos.map((p) => p.idProyecto);

  // Contar jurados únicos
  const totalUnicos = await DocenteProyecto.count({
    where: { idProyecto: { [Op.in]: idsProyectos } },
    distinct: true,
    col: "idDocente",
  });

  // Total de asignaciones (puede haber docentes asignados a múltiples proyectos)
  const total = await DocenteProyecto.count({
    where: { idProyecto: { [Op.in]: idsProyectos } },
  });

  return {
    total,
    totalUnicos,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * KPI 5: Total de eventos realizados
 * Los eventos no están vinculados directamente a Feria, se filtran por fechas
 */
const getEventosRealizados = async (filtros = {}) => {
  const feriaActual = await getFeriaActual();

  const whereEvento = {};

  // Filtrar por rango de fechas si se proporciona
  if (filtros.fechaInicio || filtros.fechaFin) {
    whereEvento.fechaProgramada = {};
    if (filtros.fechaInicio) {
      whereEvento.fechaProgramada[Op.gte] = new Date(filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      whereEvento.fechaProgramada[Op.lte] = new Date(filtros.fechaFin);
    }
  }

  const total = await Evento.count({ where: whereEvento });
  const activos = await Evento.count({
    where: { ...whereEvento, estaActivo: true },
  });
  const inactivos = total - activos;

  return {
    total,
    activos,
    inactivos,
    filtros: {
      fechaInicio: filtros.fechaInicio || null,
      fechaFin: filtros.fechaFin || null,
    },
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * KPI 6: % de proyectos aprobados por tutor
 */
const getPorcentajeAprobadosTutor = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  const proyectos = await Proyecto.findAll(queryOptions);
  const totalProyectos = proyectos.length;

  const aprobadosPorTutor = proyectos.filter(
    (p) => p.estaAprobadoTutor === true
  ).length;
  const rechazadosPorTutor = proyectos.filter(
    (p) => p.estaAprobadoTutor === false
  ).length;
  const pendientesTutor = proyectos.filter(
    (p) => p.estaAprobadoTutor === null
  ).length;

  return {
    totalProyectos,
    aprobadosPorTutor,
    rechazadosPorTutor,
    pendientesTutor,
    porcentajeAprobados:
      totalProyectos > 0
        ? parseFloat(((aprobadosPorTutor / totalProyectos) * 100).toFixed(1))
        : 0,
    porcentajeRechazados:
      totalProyectos > 0
        ? parseFloat(((rechazadosPorTutor / totalProyectos) * 100).toFixed(1))
        : 0,
    porcentajePendientes:
      totalProyectos > 0
        ? parseFloat(((pendientesTutor / totalProyectos) * 100).toFixed(1))
        : 0,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * KPI 7: % de proyectos aprobados por administrador
 */
const getPorcentajeAprobadosAdmin = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  const proyectos = await Proyecto.findAll(queryOptions);
  const totalProyectos = proyectos.length;

  const aprobadosPorAdmin = proyectos.filter(
    (p) => p.estaAprobado === true
  ).length;
  const rechazadosPorAdmin = proyectos.filter(
    (p) => p.estaAprobado === false
  ).length;
  const pendientesAdmin = proyectos.filter(
    (p) => p.estaAprobado === null
  ).length;

  return {
    totalProyectos,
    aprobadosPorAdmin,
    rechazadosPorAdmin,
    pendientesAdmin,
    porcentajeAprobados:
      totalProyectos > 0
        ? parseFloat(((aprobadosPorAdmin / totalProyectos) * 100).toFixed(1))
        : 0,
    porcentajeRechazados:
      totalProyectos > 0
        ? parseFloat(((rechazadosPorAdmin / totalProyectos) * 100).toFixed(1))
        : 0,
    porcentajePendientes:
      totalProyectos > 0
        ? parseFloat(((pendientesAdmin / totalProyectos) * 100).toFixed(1))
        : 0,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * KPI 8: % de proyectos aprobados para exposición en feria
 */
const getPorcentajeAprobadosExposicion = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  const proyectos = await Proyecto.findAll(queryOptions);
  const totalProyectos = proyectos.length;

  const aprobadosExposicion = proyectos.filter((p) => p.esFinal === true)
    .length;
  const noAprobadosExposicion = proyectos.filter((p) => p.esFinal === false)
    .length;
  const pendientesExposicion = proyectos.filter((p) => p.esFinal === null)
    .length;

  return {
    totalProyectos,
    aprobadosExposicion,
    noAprobadosExposicion,
    pendientesExposicion,
    porcentajeAprobados:
      totalProyectos > 0
        ? parseFloat(
            ((aprobadosExposicion / totalProyectos) * 100).toFixed(1)
          )
        : 0,
    porcentajeNoAprobados:
      totalProyectos > 0
        ? parseFloat(
            ((noAprobadosExposicion / totalProyectos) * 100).toFixed(1)
          )
        : 0,
    porcentajePendientes:
      totalProyectos > 0
        ? parseFloat(
            ((pendientesExposicion / totalProyectos) * 100).toFixed(1)
          )
        : 0,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * Obtener información de la feria actual
 */
const getFeriaActualInfo = async () => {
  const feria = await Feria.findOne({
    where: { estado: "Activo" },
    order: [["fechaCreacion", "DESC"]],
    include: [
      {
        model: SubCalificacion,
        as: "tipoCalificacion",
        attributes: ["idTipoCalificacion", "nombre"],
      },
      {
        model: Semestre,
        as: "semestres",
        attributes: ["idSemestre", "numero"],
      },
    ],
  });

  if (!feria) {
    throw new Error("No hay una feria activa en este momento");
  }

  return {
    idFeria: feria.idFeria,
    nombre: feria.nombre,
    semestre: feria.semestre,
    año: feria.año,
    estado: feria.estado,
    fechaCreacion: feria.fechaCreacion,
    fechaActualizacion: feria.fechaActualizacion,
    tipoCalificacion: feria.tipoCalificacion,
    semestres: feria.semestres,
  };
};

// ============================================
// ENDPOINTS DE GRÁFICOS
// ============================================

/**
 * Gráfico 1: Proyectos por estado
 */
const getProyectosPorEstado = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  // Obtener todos los proyectos con sus relaciones
  const proyectos = await Proyecto.findAll({
    ...queryOptions,
    include: [
      ...queryOptions.include,
      {
        model: DocenteProyecto,
        as: "docentesProyecto",
        include: [
          {
            model: Calificacion,
            as: "calificaciones",
          },
        ],
      },
    ],
  });

  const totalProyectos = proyectos.length;

  // Contar por estados
  const borrador = proyectos.filter(
    (p) => p.estaAprobado === null && p.estaAprobadoTutor === null
  ).length;

  const enviado = proyectos.filter((p) => {
    return p.revisiones.some((r) => r.revisado === false);
  }).length;

  const aprobadoTutor = proyectos.filter(
    (p) => p.estaAprobadoTutor === true
  ).length;

  const conJurados = proyectos.filter(
    (p) => p.docentesProyecto && p.docentesProyecto.length > 0
  ).length;

  const calificado = proyectos.filter((p) => {
    if (!p.docentesProyecto || p.docentesProyecto.length === 0) return false;
    return p.docentesProyecto.every((dp) => {
      return (
        dp.calificaciones &&
        dp.calificaciones.length > 0 &&
        dp.calificaciones.every((c) => c.calificado === true)
      );
    });
  }).length;

  const estados = [
    {
      estado: "borrador",
      descripcion: "Proyectos en borrador (sin aprobaciones)",
      cantidad: borrador,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((borrador / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "enviado",
      descripcion: "Proyectos enviados para revisión",
      cantidad: enviado,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((enviado / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "aprobado_tutor",
      descripcion: "Proyectos aprobados por tutor",
      cantidad: aprobadoTutor,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((aprobadoTutor / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "con_jurados",
      descripcion: "Proyectos con jurados asignados",
      cantidad: conJurados,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((conJurados / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "calificado",
      descripcion: "Proyectos completamente calificados",
      cantidad: calificado,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((calificado / totalProyectos) * 100).toFixed(1))
          : 0,
    },
  ];

  return {
    estados,
    totalProyectos,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * Gráfico 2: Participación por Área y Categoría
 */
const getParticipacionAreaCategoria = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  // Obtener proyectos con estudiantes
  const proyectos = await Proyecto.findAll({
    ...queryOptions,
    include: [
      ...queryOptions.include,
      {
        model: EstudianteProyecto,
        as: "estudiantesProyecto",
      },
    ],
  });

  // Agrupar por área y categoría
  const participacionMap = new Map();

  proyectos.forEach((proyecto) => {
    const area = proyecto.grupoMateria.materia.areaCategoria.area;
    const categoria = proyecto.grupoMateria.materia.areaCategoria.categoria;
    const key = `${area.idArea}-${categoria.idCategoria}`;

    if (!participacionMap.has(key)) {
      participacionMap.set(key, {
        area: {
          idArea: area.idArea,
          nombre: area.nombre,
        },
        categoria: {
          idCategoria: categoria.idCategoria,
          nombre: categoria.nombre,
        },
        proyectos: [],
        estudiantes: new Set(),
      });
    }

    const entry = participacionMap.get(key);
    entry.proyectos.push(proyecto.idProyecto);

    // Agregar estudiantes únicos
    if (proyecto.estudiantesProyecto) {
      proyecto.estudiantesProyecto.forEach((ep) => {
        entry.estudiantes.add(ep.idEstudiante);
      });
    }
  });

  // Calcular totales
  const totalProyectos = proyectos.length;
  const totalEstudiantes = new Set(
    proyectos.flatMap((p) =>
      p.estudiantesProyecto
        ? p.estudiantesProyecto.map((ep) => ep.idEstudiante)
        : []
    )
  ).size;

  // Formatear resultado
  const participacion = Array.from(participacionMap.values()).map((entry) => ({
    area: entry.area,
    categoria: entry.categoria,
    totalProyectos: entry.proyectos.length,
    totalEstudiantes: entry.estudiantes.size,
    porcentajeProyectos:
      totalProyectos > 0
        ? parseFloat(
            ((entry.proyectos.length / totalProyectos) * 100).toFixed(1)
          )
        : 0,
    porcentajeEstudiantes:
      totalEstudiantes > 0
        ? parseFloat(
            ((entry.estudiantes.size / totalEstudiantes) * 100).toFixed(1)
          )
        : 0,
  }));

  return {
    participacion,
    totales: {
      totalProyectos,
      totalEstudiantes,
    },
    filtros: {
      areaId: filtros.areaId || null,
      categoriaId: filtros.categoriaId || null,
      semestreId: filtros.semestreId || null,
    },
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * Gráfico 3: Carga y Desempeño de Jurados
 */
const getCargaDesempenoJurados = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  // Obtener proyectos
  const proyectos = await Proyecto.findAll(queryOptions);
  const idsProyectos = proyectos.map((p) => p.idProyecto);

  // Obtener todos los DocenteProyecto con calificaciones
  const docentesProyecto = await DocenteProyecto.findAll({
    where: { idProyecto: { [Op.in]: idsProyectos } },
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
      {
        model: Calificacion,
        as: "calificaciones",
      },
    ],
  });

  // Agrupar por docente
  const juradosMap = new Map();

  docentesProyecto.forEach((dp) => {
    const idDocente = dp.idDocente;

    if (!juradosMap.has(idDocente)) {
      juradosMap.set(idDocente, {
        docente: {
          idDocente: dp.docente.idDocente,
          codigoDocente: dp.docente.codigoDocente,
          usuario: dp.docente.usuario,
        },
        proyectosAsignados: new Set(),
        proyectosCalificados: new Set(),
        calificaciones: [],
        fechasCalificacion: [],
      });
    }

    const entry = juradosMap.get(idDocente);
    entry.proyectosAsignados.add(dp.idProyecto);

    // Verificar si el proyecto está calificado
    const todasCalificadas =
      dp.calificaciones &&
      dp.calificaciones.length > 0 &&
      dp.calificaciones.every((c) => c.calificado === true);

    if (todasCalificadas) {
      entry.proyectosCalificados.add(dp.idProyecto);
    }

    // Agregar calificaciones
    if (dp.calificaciones) {
      dp.calificaciones.forEach((cal) => {
        if (cal.calificado) {
          entry.calificaciones.push(cal.puntajeObtenido);
          entry.fechasCalificacion.push({
            fechaCreacion: dp.fechaCreacion,
            fechaCalificacion: cal.fechaActualizacion,
          });
        }
      });
    }
  });

  // Formatear resultado
  const jurados = Array.from(juradosMap.values()).map((entry) => {
    const proyectosAsignados = entry.proyectosAsignados.size;
    const proyectosCalificados = entry.proyectosCalificados.size;
    const proyectosPendientes = proyectosAsignados - proyectosCalificados;

    const promedioCalificacion =
      entry.calificaciones.length > 0
        ? parseFloat(
            (
              entry.calificaciones.reduce((a, b) => a + b, 0) /
              entry.calificaciones.length
            ).toFixed(1)
          )
        : 0;

    // Calcular tiempo promedio de calificación (en días)
    const tiemposCalificacion = entry.fechasCalificacion
      .map((f) => {
        const inicio = new Date(f.fechaCreacion);
        const fin = new Date(f.fechaCalificacion);
        return (fin - inicio) / (1000 * 60 * 60 * 24); // días
      })
      .filter((t) => t >= 0);

    const tiempoPromedio =
      tiemposCalificacion.length > 0
        ? parseFloat(
            (
              tiemposCalificacion.reduce((a, b) => a + b, 0) /
              tiemposCalificacion.length
            ).toFixed(1)
          )
        : 0;

    return {
      docente: entry.docente,
      carga: {
        proyectosAsignados,
        proyectosCalificados,
        proyectosPendientes,
        porcentajeCompletado:
          proyectosAsignados > 0
            ? parseFloat(
                ((proyectosCalificados / proyectosAsignados) * 100).toFixed(1)
              )
            : 0,
      },
      desempeno: {
        promedioCalificacionOtorgada: promedioCalificacion,
        tiempoPromedioCalificacion: tiempoPromedio,
        calificacionesRealizadas: entry.calificaciones.length,
      },
    };
  });

  // Calcular estadísticas generales
  const totalJurados = jurados.length;
  const promedioProyectosPorJurado =
    totalJurados > 0
      ? parseFloat(
          (
            jurados.reduce((sum, j) => sum + j.carga.proyectosAsignados, 0) /
            totalJurados
          ).toFixed(1)
        )
      : 0;

  const todasCalificaciones = jurados.flatMap(
    (j) => j.desempeno.promedioCalificacionOtorgada
  );
  const promedioCalificacionGeneral =
    todasCalificaciones.length > 0
      ? parseFloat(
          (
            todasCalificaciones.reduce((a, b) => a + b, 0) /
            todasCalificaciones.length
          ).toFixed(1)
        )
      : 0;

  const todosTiempos = jurados
    .map((j) => j.desempeno.tiempoPromedioCalificacion)
    .filter((t) => t > 0);
  const tiempoPromedioGeneral =
    todosTiempos.length > 0
      ? parseFloat(
          (todosTiempos.reduce((a, b) => a + b, 0) / todosTiempos.length).toFixed(
            1
          )
        )
      : 0;

  return {
    jurados,
    estadisticas: {
      totalJurados,
      promedioProyectosPorJurado,
      promedioCalificacionGeneral,
      tiempoPromedioGeneral,
    },
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * Gráfico 4: Calificaciones de la Feria
 */
const getCalificacionesFeria = async (filtros = {}) => {
  const { queryOptions, feriaActual } = await buildProyectosFeriaQuery(
    filtros
  );

  // Obtener proyectos con calificaciones
  const proyectos = await Proyecto.findAll({
    ...queryOptions,
    include: [
      ...queryOptions.include,
      {
        model: DocenteProyecto,
        as: "docentesProyecto",
        include: [
          {
            model: Calificacion,
            as: "calificaciones",
            where: { calificado: true },
            required: false,
            include: [
              {
                model: SubCalificacion,
                as: "subCalificacion",
              },
            ],
          },
        ],
      },
    ],
  });

  // Calcular calificación promedio por proyecto
  const proyectosConCalificacion = [];
  const todasCalificaciones = [];
  const calificacionesPorCriterio = new Map();

  proyectos.forEach((proyecto) => {
    if (!proyecto.docentesProyecto || proyecto.docentesProyecto.length === 0)
      return;

    const calificacionesProyecto = [];

    proyecto.docentesProyecto.forEach((dp) => {
      if (dp.calificaciones && dp.calificaciones.length > 0) {
        dp.calificaciones.forEach((cal) => {
          calificacionesProyecto.push(cal.puntajeObtenido);
          todasCalificaciones.push(cal.puntajeObtenido);

          // Agrupar por criterio
          const criterio = cal.subCalificacion;
          if (criterio) {
            if (!calificacionesPorCriterio.has(criterio.idSubCalificacion)) {
              calificacionesPorCriterio.set(criterio.idSubCalificacion, {
                criterio: {
                  idSubCalificacion: criterio.idSubCalificacion,
                  nombre: criterio.nombre,
                  maximoPuntaje: criterio.maximoPuntaje,
                },
                puntajes: [],
              });
            }
            calificacionesPorCriterio
              .get(criterio.idSubCalificacion)
              .puntajes.push(cal.puntajeObtenido);
          }
        });
      }
    });

    if (calificacionesProyecto.length > 0) {
      const promedio =
        calificacionesProyecto.reduce((a, b) => a + b, 0) /
        calificacionesProyecto.length;

      proyectosConCalificacion.push({
        proyecto: {
          idProyecto: proyecto.idProyecto,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
        },
        calificacionPromedio: parseFloat(promedio.toFixed(1)),
        area: proyecto.grupoMateria.materia.areaCategoria.area.nombre,
        categoria: proyecto.grupoMateria.materia.areaCategoria.categoria.nombre,
      });
    }
  });

  // Distribución por rangos
  const rangos = [
    { rango: "0-20", cantidad: 0 },
    { rango: "21-40", cantidad: 0 },
    { rango: "41-60", cantidad: 0 },
    { rango: "61-80", cantidad: 0 },
    { rango: "81-100", cantidad: 0 },
  ];

  todasCalificaciones.forEach((cal) => {
    if (cal <= 20) rangos[0].cantidad++;
    else if (cal <= 40) rangos[1].cantidad++;
    else if (cal <= 60) rangos[2].cantidad++;
    else if (cal <= 80) rangos[3].cantidad++;
    else rangos[4].cantidad++;
  });

  const totalCalificaciones = todasCalificaciones.length;
  rangos.forEach((r) => {
    r.porcentaje =
      totalCalificaciones > 0
        ? parseFloat(((r.cantidad / totalCalificaciones) * 100).toFixed(1))
        : 0;
  });

  // Estadísticas generales
  const promedioGeneral =
    todasCalificaciones.length > 0
      ? parseFloat(
          (
            todasCalificaciones.reduce((a, b) => a + b, 0) /
            todasCalificaciones.length
          ).toFixed(1)
        )
      : 0;

  const calificacionesOrdenadas = [...todasCalificaciones].sort((a, b) => a - b);
  const mediana =
    calificacionesOrdenadas.length > 0
      ? calificacionesOrdenadas[
          Math.floor(calificacionesOrdenadas.length / 2)
        ]
      : 0;

  const varianza =
    todasCalificaciones.length > 0
      ? todasCalificaciones.reduce(
          (sum, cal) => sum + Math.pow(cal - promedioGeneral, 2),
          0
        ) / todasCalificaciones.length
      : 0;
  const desviacionEstandar = parseFloat(Math.sqrt(varianza).toFixed(1));

  // Calificaciones por criterio
  const porCriterio = Array.from(calificacionesPorCriterio.values()).map(
    (entry) => {
      const promedio =
        entry.puntajes.reduce((a, b) => a + b, 0) / entry.puntajes.length;
      return {
        criterio: entry.criterio,
        promedio: parseFloat(promedio.toFixed(1)),
        porcentajePromedio: parseFloat(
          ((promedio / entry.criterio.maximoPuntaje) * 100).toFixed(1)
        ),
      };
    }
  );

  // Top proyectos
  const topProyectos = proyectosConCalificacion
    .sort((a, b) => b.calificacionPromedio - a.calificacionPromedio)
    .slice(0, 5);

  return {
    distribucion: {
      rangos,
      totalProyectosCalificados: proyectosConCalificacion.length,
    },
    estadisticas: {
      promedioGeneral,
      mediana,
      desviacionEstandar,
      calificacionMaxima:
        calificacionesOrdenadas.length > 0
          ? calificacionesOrdenadas[calificacionesOrdenadas.length - 1]
          : 0,
      calificacionMinima:
        calificacionesOrdenadas.length > 0 ? calificacionesOrdenadas[0] : 0,
    },
    porCriterio,
    topProyectos,
    filtros: formatFiltros(filtros),
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

/**
 * Gráfico 5: Participación en Eventos
 */
const getParticipacionEventos = async (filtros = {}) => {
  const feriaActual = await getFeriaActual();

  const whereEvento = {};

  // Filtrar por rango de fechas
  if (filtros.fechaInicio || filtros.fechaFin) {
    whereEvento.fechaProgramada = {};
    if (filtros.fechaInicio) {
      whereEvento.fechaProgramada[Op.gte] = new Date(filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      whereEvento.fechaProgramada[Op.lte] = new Date(filtros.fechaFin);
    }
  }

  // Obtener eventos con participantes
  const eventos = await Evento.findAll({
    where: whereEvento,
    include: [
      {
        model: EstudianteEvento,
        as: "estudiantesEventos",
        include: [
          {
            model: Estudiante,
            as: "estudiante",
            include: [
              {
                model: EstudianteProyecto,
                as: "estudiantesProyecto",
                include: [
                  {
                    model: Proyecto,
                    as: "proyecto",
                    include: [
                      {
                        model: GrupoMateria,
                        as: "grupoMateria",
                        include: [
                          {
                            model: Materia,
                            as: "materia",
                            include: [
                              {
                                model: AreaCategoria,
                                as: "areaCategoria",
                                include: [
                                  { model: Area, as: "area" },
                                  { model: Categoria, as: "categoria" },
                                ],
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
          },
        ],
      },
    ],
  });

  // Procesar eventos
  const eventosFormateados = eventos.map((evento) => {
    const totalInscritos = evento.estudiantesEventos
      ? evento.estudiantesEventos.length
      : 0;

    const porcentajeCapacidad =
      evento.capacidadMaxima && evento.capacidadMaxima > 0
        ? parseFloat(
            ((totalInscritos / evento.capacidadMaxima) * 100).toFixed(1)
          )
        : 0;

    // Agrupar por área y categoría
    const areaMap = new Map();
    const categoriaMap = new Map();

    if (evento.estudiantesEventos) {
      evento.estudiantesEventos.forEach((ee) => {
        const estudiante = ee.estudiante;
        if (
          estudiante &&
          estudiante.estudiantesProyecto &&
          estudiante.estudiantesProyecto.length > 0
        ) {
          const proyecto = estudiante.estudiantesProyecto[0].proyecto;
          if (proyecto && proyecto.grupoMateria) {
            const area =
              proyecto.grupoMateria.materia.areaCategoria.area.nombre;
            const categoria =
              proyecto.grupoMateria.materia.areaCategoria.categoria.nombre;

            areaMap.set(area, (areaMap.get(area) || 0) + 1);
            categoriaMap.set(
              categoria,
              (categoriaMap.get(categoria) || 0) + 1
            );
          }
        }
      });
    }

    const estudiantesPorArea = Array.from(areaMap.entries()).map(
      ([area, cantidad]) => ({
        area,
        cantidad,
        porcentaje:
          totalInscritos > 0
            ? parseFloat(((cantidad / totalInscritos) * 100).toFixed(1))
            : 0,
      })
    );

    const estudiantesPorCategoria = Array.from(categoriaMap.entries()).map(
      ([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje:
          totalInscritos > 0
            ? parseFloat(((cantidad / totalInscritos) * 100).toFixed(1))
            : 0,
      })
    );

    return {
      evento: {
        idEvento: evento.idEvento,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        fechaProgramada: evento.fechaProgramada,
        capacidadMaxima: evento.capacidadMaxima,
        estaActivo: evento.estaActivo,
      },
      participacion: {
        totalInscritos,
        porcentajeCapacidad,
        estudiantesPorArea,
        estudiantesPorCategoria,
      },
    };
  });

  // Estadísticas generales
  const totalEventos = eventos.length;
  const participacionesUnicas = new Set(
    eventos.flatMap((e) =>
      e.estudiantesEventos
        ? e.estudiantesEventos.map((ee) => ee.idEstudiante)
        : []
    )
  ).size;

  const promedioParticipacion =
    totalEventos > 0
      ? Math.round(
          eventos.reduce(
            (sum, e) => sum + (e.estudiantesEventos?.length || 0),
            0
          ) / totalEventos
        )
      : 0;

  const eventosPorParticipacion = [...eventos].sort(
    (a, b) =>
      (b.estudiantesEventos?.length || 0) - (a.estudiantesEventos?.length || 0)
  );

  return {
    eventos: eventosFormateados,
    estadisticas: {
      totalEventos,
      totalParticipacionesUnicas: participacionesUnicas,
      promedioParticipacionPorEvento: promedioParticipacion,
      eventoMasPopular:
        eventosPorParticipacion.length > 0
          ? {
              nombre: eventosPorParticipacion[0].nombre,
              participantes:
                eventosPorParticipacion[0].estudiantesEventos?.length || 0,
            }
          : null,
      eventoMenosPopular:
        eventosPorParticipacion.length > 0
          ? {
              nombre:
                eventosPorParticipacion[eventosPorParticipacion.length - 1]
                  .nombre,
              participantes:
                eventosPorParticipacion[eventosPorParticipacion.length - 1]
                  .estudiantesEventos?.length || 0,
            }
          : null,
    },
    filtros: {
      fechaInicio: filtros.fechaInicio || null,
      fechaFin: filtros.fechaFin || null,
      areaId: filtros.areaId || null,
      categoriaId: filtros.categoriaId || null,
    },
    feriaActual: formatFeriaInfo(feriaActual),
  };
};


module.exports = {
  // Auxiliares
  getFeriaActual,
  getTarea0,
  buildProyectosFeriaQuery,

  // KPIs
  getProyectosInscritos,
  getEstudiantesParticipantes,
  getTutores,
  getJurados,
  getEventosRealizados,
  getPorcentajeAprobadosTutor,
  getPorcentajeAprobadosAdmin,
  getPorcentajeAprobadosExposicion,

  // Gráficos
  getProyectosPorEstado,
  getParticipacionAreaCategoria,
  getCargaDesempenoJurados,
  getCalificacionesFeria,
  getParticipacionEventos,

  // Auxiliar
  getFeriaActualInfo,
};

