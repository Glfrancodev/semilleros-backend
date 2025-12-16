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

/**
 * Función auxiliar: Obtener proyectos de la feria actual con filtros
 * Retorna los proyectos completos para poder acceder a sus propiedades
 */
const getProyectosFeriaActual = async (filtros = {}) => {
  const feriaActual = await getFeriaActual();
  const tarea0 = await getTarea0(feriaActual.idFeria);

  const revisiones = await Revision.findAll({
    where: { idTarea: tarea0.idTarea },
    attributes: ["idProyecto"],
    include: [
      {
        model: Proyecto,
        as: "proyecto",
        required: true,
        include: [
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
                where: filtros.materiaId ? { idMateria: filtros.materiaId } : {},
                include: [
                  {
                    model: AreaCategoria,
                    as: "areaCategoria",
                    required: true,
                    where: {
                      ...(filtros.areaId ? { idArea: filtros.areaId } : {}),
                      ...(filtros.categoriaId
                        ? { idCategoria: filtros.categoriaId }
                        : {}),
                    },
                    include: [
                      {
                        model: Area,
                        as: "area",
                      },
                      {
                        model: Categoria,
                        as: "categoria",
                      },
                    ],
                  },
                  {
                    model: Semestre,
                    as: "semestre",
                    required: filtros.semestreId ? true : false,
                    where: filtros.semestreId
                      ? { idSemestre: filtros.semestreId }
                      : {},
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  // Retornar proyectos únicos
  const proyectosMap = new Map();
  revisiones.forEach((r) => {
    if (r.proyecto && !proyectosMap.has(r.proyecto.idProyecto)) {
      proyectosMap.set(r.proyecto.idProyecto, r.proyecto);
    }
  });

  return {
    proyectos: Array.from(proyectosMap.values()),
    feriaActual,
  };
};

// ============================================
// ENDPOINTS DE KPIs
// ============================================

/**
 * KPI 1: Total de proyectos inscritos
 */
const getProyectosInscritos = async (filtros = {}) => {
  const feriaActual = await getFeriaActual();
  const tarea0 = await getTarea0(feriaActual.idFeria);

  // Obtener proyectos únicos que tienen revisión de la tarea 0
  const revisiones = await Revision.findAll({
    where: { idTarea: tarea0.idTarea },
    include: [
      {
        model: Proyecto,
        as: "proyecto",
        required: true,
        include: [
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
                where: filtros.materiaId ? { idMateria: filtros.materiaId } : {},
                include: [
                  {
                    model: AreaCategoria,
                    as: "areaCategoria",
                    required: true,
                    where: {
                      ...(filtros.areaId ? { idArea: filtros.areaId } : {}),
                      ...(filtros.categoriaId
                        ? { idCategoria: filtros.categoriaId }
                        : {}),
                    },
                  },
                  {
                    model: Semestre,
                    as: "semestre",
                    required: filtros.semestreId ? true : false,
                    where: filtros.semestreId
                      ? { idSemestre: filtros.semestreId }
                      : {},
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  // Contar proyectos únicos
  const proyectosUnicos = new Set(revisiones.map((r) => r.idProyecto));
  const total = proyectosUnicos.size;

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
  const feriaActual = await getFeriaActual();
  const tarea0 = await getTarea0(feriaActual.idFeria);

  // Obtener proyectos únicos que tienen revisión de la tarea 0
  const revisiones = await Revision.findAll({
    where: { idTarea: tarea0.idTarea },
    attributes: ["idProyecto"],
    include: [
      {
        model: Proyecto,
        as: "proyecto",
        required: true,
        include: [
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
                where: filtros.materiaId ? { idMateria: filtros.materiaId } : {},
                include: [
                  {
                    model: AreaCategoria,
                    as: "areaCategoria",
                    required: true,
                    where: {
                      ...(filtros.areaId ? { idArea: filtros.areaId } : {}),
                      ...(filtros.categoriaId
                        ? { idCategoria: filtros.categoriaId }
                        : {}),
                    },
                  },
                  {
                    model: Semestre,
                    as: "semestre",
                    required: filtros.semestreId ? true : false,
                    where: filtros.semestreId
                      ? { idSemestre: filtros.semestreId }
                      : {},
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  // Obtener IDs únicos de proyectos
  const idsProyectos = [...new Set(revisiones.map((r) => r.idProyecto))];

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
  const feriaActual = await getFeriaActual();
  const tarea0 = await getTarea0(feriaActual.idFeria);

  // Obtener proyectos con sus grupos
  const revisiones = await Revision.findAll({
    where: { idTarea: tarea0.idTarea },
    attributes: ["idProyecto"],
    include: [
      {
        model: Proyecto,
        as: "proyecto",
        required: true,
        include: [
          {
            model: GrupoMateria,
            as: "grupoMateria",
            required: true,
            attributes: ["idDocente"],
            where: filtros.grupoMateriaId
              ? { idGrupoMateria: filtros.grupoMateriaId }
              : {},
            include: [
              {
                model: Materia,
                as: "materia",
                required: true,
                where: filtros.materiaId ? { idMateria: filtros.materiaId } : {},
                include: [
                  {
                    model: AreaCategoria,
                    as: "areaCategoria",
                    required: true,
                    where: {
                      ...(filtros.areaId ? { idArea: filtros.areaId } : {}),
                      ...(filtros.categoriaId
                        ? { idCategoria: filtros.categoriaId }
                        : {}),
                    },
                  },
                  {
                    model: Semestre,
                    as: "semestre",
                    required: filtros.semestreId ? true : false,
                    where: filtros.semestreId
                      ? { idSemestre: filtros.semestreId }
                      : {},
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  // Extraer IDs únicos de docentes (tutores)
  const idsDocentes = [
    ...new Set(
      revisiones
        .map((r) => r.proyecto?.grupoMateria?.idDocente)
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
  const feriaActual = await getFeriaActual();
  const tarea0 = await getTarea0(feriaActual.idFeria);

  // Obtener proyectos de la feria
  const revisiones = await Revision.findAll({
    where: { idTarea: tarea0.idTarea },
    attributes: ["idProyecto"],
    include: [
      {
        model: Proyecto,
        as: "proyecto",
        required: true,
        include: [
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
                where: filtros.materiaId ? { idMateria: filtros.materiaId } : {},
                include: [
                  {
                    model: AreaCategoria,
                    as: "areaCategoria",
                    required: true,
                    where: {
                      ...(filtros.areaId ? { idArea: filtros.areaId } : {}),
                      ...(filtros.categoriaId
                        ? { idCategoria: filtros.categoriaId }
                        : {}),
                    },
                  },
                  {
                    model: Semestre,
                    as: "semestre",
                    required: filtros.semestreId ? true : false,
                    where: filtros.semestreId
                      ? { idSemestre: filtros.semestreId }
                      : {},
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  const idsProyectos = [...new Set(revisiones.map((r) => r.idProyecto))];

  // Contar jurados únicos
  const totalUnicos = await DocenteProyecto.count({
    where: { idProyecto: { [Op.in]: idsProyectos } },
    distinct: true,
    col: "idDocente",
  });

  // Total de asignaciones
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
  const { proyectos, feriaActual } = await getProyectosFeriaActual(filtros);
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
  const { proyectos, feriaActual } = await getProyectosFeriaActual(filtros);
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
  const { proyectos, feriaActual } = await getProyectosFeriaActual(filtros);
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
  };
};

// ============================================
// ENDPOINTS DE GRÁFICOS
// ============================================

/**
 * Gráfico 1: Proyectos por estado
 */
const getProyectosPorEstado = async (filtros = {}) => {
  const { proyectos, feriaActual } = await getProyectosFeriaActual(filtros);

  // Obtener jurados y calificaciones para cada proyecto
  const proyectosConJurados = await Promise.all(
    proyectos.map(async (p) => {
      const jurados = await DocenteProyecto.findAll({
        where: { idProyecto: p.idProyecto },
        include: [
          {
            model: Calificacion,
            as: "calificaciones",
          },
        ],
      });

      return {
        proyecto: p,
        cantidadJurados: jurados.length,
        juradosCalificados: jurados.filter((j) =>
          j.calificaciones?.every((c) => c.calificado === true)
        ).length,
      };
    })
  );

  const totalProyectos = proyectosConJurados.length;

  // Clasificar cada proyecto en UN SOLO estado (con prioridad)
  const contadores = {
    calificado: 0,
    conJurados: 0,
    aprobado: 0,
    rechazado: 0,
    borrador: 0,
  };

  proyectosConJurados.forEach(({ proyecto: p, cantidadJurados, juradosCalificados }) => {
    // Prioridad 1: Calificado (los 3 jurados calificaron)
    if (cantidadJurados === 3 && juradosCalificados === 3) {
      contadores.calificado++;
    }
    // Prioridad 2: Con Jurados (tiene 3 jurados asignados pero no todos calificaron)
    else if (cantidadJurados === 3) {
      contadores.conJurados++;
    }
    // Prioridad 3: Rechazado (alguno de los dos está en false)
    else if (p.estaAprobadoTutor === false || p.estaAprobado === false) {
      contadores.rechazado++;
    }
    // Prioridad 4: Aprobado (ambos en true)
    else if (p.estaAprobadoTutor === true && p.estaAprobado === true) {
      contadores.aprobado++;
    }
    // Prioridad 5: Borrador (alguno de los dos está en null)
    else {
      contadores.borrador++;
    }
  });

  const estados = [
    {
      estado: "borrador",
      descripcion: "Proyectos en borrador (aprobaciones pendientes)",
      cantidad: contadores.borrador,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((contadores.borrador / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "aprobado",
      descripcion: "Proyectos aprobados por tutor y administrador",
      cantidad: contadores.aprobado,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((contadores.aprobado / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "rechazado",
      descripcion: "Proyectos rechazados por tutor o administrador",
      cantidad: contadores.rechazado,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((contadores.rechazado / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "con_jurados",
      descripcion: "Proyectos con 3 jurados asignados",
      cantidad: contadores.conJurados,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((contadores.conJurados / totalProyectos) * 100).toFixed(1))
          : 0,
    },
    {
      estado: "calificado",
      descripcion: "Proyectos calificados por los 3 jurados",
      cantidad: contadores.calificado,
      porcentaje:
        totalProyectos > 0
          ? parseFloat(((contadores.calificado / totalProyectos) * 100).toFixed(1))
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
        calificacionesPorProyecto: new Map(), // Cambio: agrupar por proyecto
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

    // Agregar calificaciones agrupadas por proyecto
    if (dp.calificaciones && dp.calificaciones.length > 0) {
      const calificacionesCalificadas = dp.calificaciones.filter(
        (cal) => cal.calificado
      );

      if (calificacionesCalificadas.length > 0) {
        // Sumar todas las subcalificaciones del proyecto
        const totalProyecto = calificacionesCalificadas.reduce(
          (sum, cal) => sum + cal.puntajeObtenido,
          0
        );

        entry.calificacionesPorProyecto.set(dp.idProyecto, totalProyecto);

        // Guardar fecha de calificación (usar la más reciente)
        const fechaMasReciente = calificacionesCalificadas.reduce((latest, cal) => {
          const calDate = new Date(cal.fechaActualizacion);
          return calDate > latest ? calDate : latest;
        }, new Date(0));

        entry.fechasCalificacion.push({
          fechaCreacion: dp.fechaCreacion,
          fechaCalificacion: fechaMasReciente,
        });
      }
    }
  });

  // Formatear resultado
  const jurados = Array.from(juradosMap.values()).map((entry) => {
    const proyectosAsignados = entry.proyectosAsignados.size;
    const proyectosCalificados = entry.proyectosCalificados.size;
    const proyectosPendientes = proyectosAsignados - proyectosCalificados;

    // Calcular promedio de calificaciones por proyecto
    const calificacionesProyectos = Array.from(
      entry.calificacionesPorProyecto.values()
    );
    const promedioCalificacion =
      calificacionesProyectos.length > 0
        ? parseFloat(
            (
              calificacionesProyectos.reduce((a, b) => a + b, 0) /
              calificacionesProyectos.length
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
        calificacionesRealizadas: calificacionesProyectos.length,
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
  const { proyectos, feriaActual } = await getProyectosFeriaActual(filtros);

  // Obtener calificaciones para cada proyecto
  const proyectosConCalificacion = [];
  const todasCalificacionesProyecto = []; // Calificaciones totales por proyecto
  const calificacionesPorCriterio = new Map();

  for (const proyecto of proyectos) {
    const docentesProyecto = await DocenteProyecto.findAll({
      where: { idProyecto: proyecto.idProyecto },
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
    });

    if (!docentesProyecto || docentesProyecto.length === 0) continue;

    // Calcular calificación total por jurado (suma de subcalificaciones)
    const calificacionesPorJurado = [];

    docentesProyecto.forEach((dp) => {
      if (dp.calificaciones && dp.calificaciones.length > 0) {
        // Sumar todas las subcalificaciones de este jurado para este proyecto
        const totalJurado = dp.calificaciones.reduce(
          (sum, cal) => sum + cal.puntajeObtenido,
          0
        );
        calificacionesPorJurado.push(totalJurado);

        // Agrupar por criterio (para estadísticas por subcalificación)
        dp.calificaciones.forEach((cal) => {
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

    if (calificacionesPorJurado.length > 0) {
      // Promedio de las calificaciones de todos los jurados para este proyecto
      const promedioProyecto =
        calificacionesPorJurado.reduce((a, b) => a + b, 0) /
        calificacionesPorJurado.length;

      // Obtener área y categoría de forma segura
      const area =
        proyecto.grupoMateria?.materia?.areaCategoria?.area?.nombre ||
        "Sin área";
      const categoria =
        proyecto.grupoMateria?.materia?.areaCategoria?.categoria?.nombre ||
        "Sin categoría";

      proyectosConCalificacion.push({
        proyecto: {
          idProyecto: proyecto.idProyecto,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
        },
        calificacionPromedio: parseFloat(promedioProyecto.toFixed(1)),
        area,
        categoria,
      });

      todasCalificacionesProyecto.push(promedioProyecto);
    }
  }

  // Distribución por rangos (basado en calificaciones de proyectos)
  const rangos = [
    { rango: "0-20", cantidad: 0 },
    { rango: "21-40", cantidad: 0 },
    { rango: "41-60", cantidad: 0 },
    { rango: "61-80", cantidad: 0 },
    { rango: "81-100", cantidad: 0 },
  ];

  todasCalificacionesProyecto.forEach((cal) => {
    if (cal <= 20) rangos[0].cantidad++;
    else if (cal <= 40) rangos[1].cantidad++;
    else if (cal <= 60) rangos[2].cantidad++;
    else if (cal <= 80) rangos[3].cantidad++;
    else rangos[4].cantidad++;
  });

  const totalCalificaciones = todasCalificacionesProyecto.length;
  rangos.forEach((r) => {
    r.porcentaje =
      totalCalificaciones > 0
        ? parseFloat(((r.cantidad / totalCalificaciones) * 100).toFixed(1))
        : 0;
  });

  // Estadísticas generales
  const promedioGeneral =
    todasCalificacionesProyecto.length > 0
      ? parseFloat(
          (
            todasCalificacionesProyecto.reduce((a, b) => a + b, 0) /
            todasCalificacionesProyecto.length
          ).toFixed(1)
        )
      : 0;

  const calificacionesOrdenadas = [...todasCalificacionesProyecto].sort(
    (a, b) => a - b
  );
  const mediana =
    calificacionesOrdenadas.length > 0
      ? calificacionesOrdenadas[Math.floor(calificacionesOrdenadas.length / 2)]
      : 0;

  const varianza =
    todasCalificacionesProyecto.length > 0
      ? todasCalificacionesProyecto.reduce(
          (sum, cal) => sum + Math.pow(cal - promedioGeneral, 2),
          0
        ) / todasCalificacionesProyecto.length
      : 0;
  const desviacionEstandar = parseFloat(Math.sqrt(varianza).toFixed(1));

  // Calificaciones por criterio (promedio de cada subcalificación)
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
                model: Usuario,
                as: "usuario",
                attributes: ["nombre", "apellido"],
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
    },
    feriaActual: formatFeriaInfo(feriaActual),
  };
};

// ============================================
// REPORTES GLOBALES - FUNCIONES AUXILIARES
// ============================================

/**
 * Calcular crecimiento porcentual entre dos valores
 */
const calcularCrecimiento = (valorActual, valorAnterior) => {
  if (!valorAnterior || valorAnterior === 0) return null;
  
  const crecimiento = ((valorActual - valorAnterior) / valorAnterior) * 100;
  
  return {
    valor: parseFloat(crecimiento.toFixed(1)),
    tipo: crecimiento >= 0 ? 'incremento' : 'decremento'
  };
};

/**
 * Determinar tendencia basada en variación promedio
 */
const determinarTendencia = (variacionPromedio) => {
  if (variacionPromedio > 5) return 'creciente';
  if (variacionPromedio < -5) return 'decreciente';
  return 'estable';
};

/**
 * Aplicar filtros comunes a queries globales
 */
const aplicarFiltrosGlobales = (filtros) => {
  const where = {};
  
  // Filtrar por año basado en las fechas proporcionadas
  if (filtros.fechaInicio && filtros.fechaFin) {
    const añoInicio = new Date(filtros.fechaInicio).getFullYear();
    const añoFin = new Date(filtros.fechaFin).getFullYear();
    where.año = {
      [Op.between]: [añoInicio, añoFin]
    };
  } else if (filtros.fechaInicio) {
    const añoInicio = new Date(filtros.fechaInicio).getFullYear();
    where.año = {
      [Op.gte]: añoInicio
    };
  } else if (filtros.fechaFin) {
    const añoFin = new Date(filtros.fechaFin).getFullYear();
    where.año = {
      [Op.lte]: añoFin
    };
  }
  
  if (filtros.ferias && filtros.ferias.length > 0) {
    where.idFeria = {
      [Op.in]: filtros.ferias
    };
  }
  
  return where;
};

// ============================================
// REPORTES GLOBALES - KPIs
// ============================================

/**
 * Obtener proyectos por feria (serie temporal)
 */
const getProyectosPorFeriaGlobal = async (filtros = {}) => {
  try {
    // Construir filtros para ferias
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    // Obtener ferias ordenadas cronológicamente
    const ferias = await Feria.findAll({
      where: whereFeria,
      order: [['año', 'ASC'], ['semestre', 'ASC']],
      attributes: ['idFeria', 'nombre', 'semestre', 'año']
    });

    // Construir filtros para proyectos
    const whereProyecto = {};
    if (filtros.areaId) {
      whereProyecto.idArea = filtros.areaId;
    }
    if (filtros.categoriaId) {
      whereProyecto.idCategoria = filtros.categoriaId;
    }

    // Obtener conteo de proyectos por feria
    const series = [];
    let valorAnterior = null;

    for (const feria of ferias) {
      // Contar proyectos únicos de esta feria a través de Tarea → Revision → Proyecto
      const proyectosCount = await sequelize.query(`
        SELECT COUNT(DISTINCT p."idProyecto") as total
        FROM "Proyecto" p
        INNER JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
        INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        WHERE t."idFeria" = :idFeria
        AND t."orden" = 0
        ${filtros.areaId ? 'AND p."idArea" = :idArea' : ''}
        ${filtros.categoriaId ? 'AND p."idCategoria" = :idCategoria' : ''}
      `, {
        replacements: {
          idFeria: feria.idFeria,
          ...(filtros.areaId && { idArea: filtros.areaId }),
          ...(filtros.categoriaId && { idCategoria: filtros.categoriaId })
        },
        type: sequelize.QueryTypes.SELECT
      });

      const totalProyectos = parseInt(proyectosCount[0]?.total || 0);
      const crecimiento = calcularCrecimiento(totalProyectos, valorAnterior);

      series.push({
        feria: {
          idFeria: feria.idFeria,
          nombre: feria.nombre,
          semestre: feria.semestre,
          año: feria.año
        },
        totalProyectos,
        crecimiento
      });

      valorAnterior = totalProyectos;
    }

    // Calcular estadísticas
    const totales = series.map(s => s.totalProyectos);
    const promedioProyectosPorFeria = totales.length > 0 
      ? parseFloat((totales.reduce((a, b) => a + b, 0) / totales.length).toFixed(1))
      : 0;

    const feriaConMasProyectos = series.reduce((max, s) => 
      s.totalProyectos > (max?.totalProyectos || 0) ? s : max, null);
    
    const feriaConMenosProyectos = series.reduce((min, s) => 
      s.totalProyectos < (min?.totalProyectos || Infinity) ? s : min, null);

    return {
      series,
      estadisticas: {
        totalFerias: series.length,
        promedioProyectosPorFeria,
        feriaConMasProyectos: feriaConMasProyectos ? {
          nombre: feriaConMasProyectos.feria.nombre,
          total: feriaConMasProyectos.totalProyectos
        } : null,
        feriaConMenosProyectos: feriaConMenosProyectos ? {
          nombre: feriaConMenosProyectos.feria.nombre,
          total: feriaConMenosProyectos.totalProyectos
        } : null
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        areaId: filtros.areaId || null,
        categoriaId: filtros.categoriaId || null
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getProyectosPorFeriaGlobal:', error);
    throw error;
  }
};

/**
 * Obtener estudiantes por feria (serie temporal)
 */
const getEstudiantesPorFeriaGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    const ferias = await Feria.findAll({
      where: whereFeria,
      order: [['año', 'ASC'], ['semestre', 'ASC']],
      attributes: ['idFeria', 'nombre', 'semestre', 'año']
    });

    const series = [];
    let valorAnterior = null;

    for (const feria of ferias) {
      // Contar estudiantes de esta feria a través de Tarea → Revision → Proyecto → EstudianteProyecto
      const estudiantesCount = await sequelize.query(`
        SELECT 
          COUNT(ep."idEstudiante") as total,
          COUNT(DISTINCT ep."idEstudiante") as unicos
        FROM "EstudianteProyecto" ep
        INNER JOIN "Proyecto" p ON p."idProyecto" = ep."idProyecto"
        INNER JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
        INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        WHERE t."idFeria" = :idFeria
        AND t."orden" = 0
        ${filtros.areaId ? 'AND p."idArea" = :idArea' : ''}
        ${filtros.categoriaId ? 'AND p."idCategoria" = :idCategoria' : ''}
      `, {
        replacements: {
          idFeria: feria.idFeria,
          ...(filtros.areaId && { idArea: filtros.areaId }),
          ...(filtros.categoriaId && { idCategoria: filtros.categoriaId })
        },
        type: sequelize.QueryTypes.SELECT
      });

      const totalEstudiantes = parseInt(estudiantesCount[0]?.total || 0);
      const estudiantesUnicos = parseInt(estudiantesCount[0]?.unicos || 0);

      const crecimiento = calcularCrecimiento(totalEstudiantes, valorAnterior);

      series.push({
        feria: {
          idFeria: feria.idFeria,
          nombre: feria.nombre,
          semestre: feria.semestre,
          año: feria.año
        },
        totalEstudiantes,
        estudiantesUnicos,
        crecimiento
      });

      valorAnterior = totalEstudiantes;
    }

    const totales = series.map(s => s.estudiantesUnicos);
    const promedioEstudiantesPorFeria = totales.length > 0
      ? parseFloat((totales.reduce((a, b) => a + b, 0) / totales.length).toFixed(1))
      : 0;

    // Calcular tasa de retención (estudiantes que participan en múltiples ferias)
    const todosEstudiantes = series.flatMap(s => 
      Array(s.totalEstudiantes).fill(null).map((_, i) => s.feria.idFeria + '-' + i)
    );
    const tasaRetencion = totales.length > 1 
      ? parseFloat(((todosEstudiantes.length / (totales.reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(1))
      : 0;

    return {
      series,
      estadisticas: {
        totalFerias: series.length,
        promedioEstudiantesPorFeria,
        tasaRetencion
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        areaId: filtros.areaId || null,
        categoriaId: filtros.categoriaId || null
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getEstudiantesPorFeriaGlobal:', error);
    throw error;
  }
};

/**
 * Obtener jurados por feria (serie temporal)
 */
const getJuradosPorFeriaGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    const ferias = await Feria.findAll({
      where: whereFeria,
      order: [['año', 'ASC'], ['semestre', 'ASC']],
      attributes: ['idFeria', 'nombre', 'semestre', 'año']
    });

    const series = [];
    let valorAnterior = null;

    for (const feria of ferias) {
      // Contar jurados de esta feria a través de Tarea → Revision → Proyecto → DocenteProyecto
      const juradosCount = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT dp."idDocenteProyecto") as total,
          COUNT(DISTINCT dp."idDocente") as unicos
        FROM "DocenteProyecto" dp
        INNER JOIN "Proyecto" p ON p."idProyecto" = dp."idProyecto"
        INNER JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
        INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        WHERE t."idFeria" = :idFeria
        AND t."orden" = 0
        ${filtros.areaId ? 'AND p."idArea" = :idArea' : ''}
        ${filtros.categoriaId ? 'AND p."idCategoria" = :idCategoria' : ''}
      `, {
        replacements: {
          idFeria: feria.idFeria,
          ...(filtros.areaId && { idArea: filtros.areaId }),
          ...(filtros.categoriaId && { idCategoria: filtros.categoriaId })
        },
        type: sequelize.QueryTypes.SELECT
      });

      const totalJurados = parseInt(juradosCount[0]?.total || 0);
      const juradosUnicos = parseInt(juradosCount[0]?.unicos || 0);
      const promedioProyectosPorJurado = juradosUnicos > 0
        ? parseFloat((totalJurados / juradosUnicos).toFixed(2))
        : 0;

      const crecimiento = calcularCrecimiento(totalJurados, valorAnterior);

      series.push({
        feria: {
          idFeria: feria.idFeria,
          nombre: feria.nombre,
          semestre: feria.semestre,
          año: feria.año
        },
        totalJurados,
        juradosUnicos,
        promedioProyectosPorJurado,
        crecimiento
      });

      valorAnterior = totalJurados;
    }

    const totales = series.map(s => s.juradosUnicos);
    const promedioJuradosPorFeria = totales.length > 0
      ? parseFloat((totales.reduce((a, b) => a + b, 0) / totales.length).toFixed(1))
      : 0;

    const cargas = series.map(s => s.promedioProyectosPorJurado).filter(c => c > 0);
    const cargaPromedioGeneral = cargas.length > 0
      ? parseFloat((cargas.reduce((a, b) => a + b, 0) / cargas.length).toFixed(2))
      : 0;

    return {
      series,
      estadisticas: {
        totalFerias: series.length,
        promedioJuradosPorFeria,
        cargaPromedioGeneral
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        areaId: filtros.areaId || null,
        categoriaId: filtros.categoriaId || null
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getJuradosPorFeriaGlobal:', error);
    throw error;
  }
};

/**
 * Obtener tutores por feria (serie temporal)
 */
const getTutoresPorFeriaGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    const ferias = await Feria.findAll({
      where: whereFeria,
      order: [['año', 'ASC'], ['semestre', 'ASC']],
      attributes: ['idFeria', 'nombre', 'semestre', 'año']
    });

    const series = [];
    let valorAnterior = null;

    for (const feria of ferias) {
      // Contar tutores de esta feria a través de Tarea → Revision → Proyecto → GrupoMateria → Docente
      const tutoresCount = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT p."idProyecto") as total,
          COUNT(DISTINCT gm."idDocente") as unicos
        FROM "Proyecto" p
        INNER JOIN "GrupoMateria" gm ON gm."idGrupoMateria" = p."idGrupoMateria"
        INNER JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
        INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        WHERE t."idFeria" = :idFeria
        AND t."orden" = 0
        ${filtros.areaId ? 'AND p."idArea" = :idArea' : ''}
        ${filtros.categoriaId ? 'AND p."idCategoria" = :idCategoria' : ''}
      `, {
        replacements: {
          idFeria: feria.idFeria,
          ...(filtros.areaId && { idArea: filtros.areaId }),
          ...(filtros.categoriaId && { idCategoria: filtros.categoriaId })
        },
        type: sequelize.QueryTypes.SELECT
      });

      const totalTutores = parseInt(tutoresCount[0]?.total || 0);
      const tutoresUnicos = parseInt(tutoresCount[0]?.unicos || 0);
      const promedioProyectosPorTutor = tutoresUnicos > 0
        ? parseFloat((totalTutores / tutoresUnicos).toFixed(2))
        : 0;

      const crecimiento = calcularCrecimiento(totalTutores, valorAnterior);

      series.push({
        feria: {
          idFeria: feria.idFeria,
          nombre: feria.nombre,
          semestre: feria.semestre,
          año: feria.año
        },
        totalTutores,
        tutoresUnicos,
        promedioProyectosPorTutor,
        crecimiento
      });

      valorAnterior = totalTutores;
    }

    const totales = series.map(s => s.tutoresUnicos);
    const promedioTutoresPorFeria = totales.length > 0
      ? parseFloat((totales.reduce((a, b) => a + b, 0) / totales.length).toFixed(1))
      : 0;

    const cargas = series.map(s => s.promedioProyectosPorTutor).filter(c => c > 0);
    const cargaPromedioGeneral = cargas.length > 0
      ? parseFloat((cargas.reduce((a, b) => a + b, 0) / cargas.length).toFixed(2))
      : 0;

    return {
      series,
      estadisticas: {
        totalFerias: series.length,
        promedioTutoresPorFeria,
        cargaPromedioGeneral
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        areaId: filtros.areaId || null,
        categoriaId: filtros.categoriaId || null
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getTutoresPorFeriaGlobal:', error);
    throw error;
  }
};

// ============================================
// REPORTES GLOBALES - TENDENCIAS
// ============================================

/**
 * Obtener áreas más frecuentes (histórico)
 */
const getAreasFrecuentesGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    const limit = filtros.limit || 10;

    // Obtener ranking de áreas con conteo de proyectos
    const ranking = await sequelize.query(`
      SELECT 
        a."idArea",
        a."nombre" as "nombreArea",
        COUNT(DISTINCT p."idProyecto") as "totalProyectos"
      FROM "Area" a
      LEFT JOIN "AreaCategoria" ac ON ac."idArea" = a."idArea"
      LEFT JOIN "Materia" m ON m."idAreaCategoria" = ac."idAreaCategoria"
      LEFT JOIN "GrupoMateria" gm ON gm."idMateria" = m."idMateria"
      LEFT JOIN "Proyecto" p ON p."idGrupoMateria" = gm."idGrupoMateria"
      LEFT JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
      LEFT JOIN "Tarea" t ON t."idTarea" = r."idTarea"
      LEFT JOIN "Feria" f ON f."idFeria" = t."idFeria"
      WHERE f."estado" IN ('Activo', 'Finalizado')
      ${filtros.fechaInicio || filtros.fechaFin ? 'AND f."año" >= :añoInicio AND f."año" <= :añoFin' : ''}
      ${filtros.ferias && filtros.ferias.length > 0 ? 'AND f."idFeria" IN (:ferias)' : ''}
      GROUP BY a."idArea", a."nombre"
      ORDER BY "totalProyectos" DESC
      LIMIT :limit
    `, {
      replacements: {
        limit,
        ...(filtros.fechaInicio && { añoInicio: new Date(filtros.fechaInicio).getFullYear() }),
        ...(filtros.fechaFin && { añoFin: new Date(filtros.fechaFin).getFullYear() }),
        ...(filtros.ferias && filtros.ferias.length > 0 && { ferias: filtros.ferias })
      },
      type: sequelize.QueryTypes.SELECT
    });

    const totalProyectos = ranking.reduce((sum, r) => sum + parseInt(r.totalProyectos), 0);

    const rankingConDetalles = await Promise.all(ranking.map(async (area) => {
      // Obtener distribución por feria para esta área
      const distribucion = await sequelize.query(`
        SELECT 
          f."nombre" as "nombreFeria",
          COUNT(DISTINCT p."idProyecto") as cantidad
        FROM "Feria" f
        INNER JOIN "Tarea" t ON t."idFeria" = f."idFeria"
        INNER JOIN "Revision" r ON r."idTarea" = t."idTarea"
        INNER JOIN "Proyecto" p ON p."idProyecto" = r."idProyecto"
        INNER JOIN "GrupoMateria" gm ON gm."idGrupoMateria" = p."idGrupoMateria"
        INNER JOIN "Materia" m ON m."idMateria" = gm."idMateria"
        INNER JOIN "AreaCategoria" ac ON ac."idAreaCategoria" = m."idAreaCategoria"
        WHERE ac."idArea" = :idArea
        AND f."estado" IN ('Activo', 'Finalizado')
        GROUP BY f."idFeria", f."nombre", f."año", f."semestre"
        ORDER BY f."año" ASC, f."semestre" ASC
      `, {
        replacements: { idArea: area.idArea },
        type: sequelize.QueryTypes.SELECT
      });

      const totalArea = parseInt(area.totalProyectos);
      const porcentajeTotal = totalProyectos > 0 ? parseFloat(((totalArea / totalProyectos) * 100).toFixed(1)) : 0;

      // Calcular tendencia
      const cantidades = distribucion.map(d => parseInt(d.cantidad));
      let variacionPromedio = 0;
      if (cantidades.length > 1) {
        const variaciones = [];
        for (let i = 1; i < cantidades.length; i++) {
          if (cantidades[i - 1] > 0) {
            variaciones.push(((cantidades[i] - cantidades[i - 1]) / cantidades[i - 1]) * 100);
          }
        }
        variacionPromedio = variaciones.length > 0 
          ? parseFloat((variaciones.reduce((a, b) => a + b, 0) / variaciones.length).toFixed(1))
          : 0;
      }

      return {
        area: {
          idArea: area.idArea,
          nombre: area.nombreArea
        },
        totalProyectos: totalArea,
        porcentajeTotal,
        tendencia: {
          direccion: determinarTendencia(variacionPromedio),
          variacionPromedio
        },
        distribucionPorFeria: distribucion.map(d => ({
          feria: d.nombreFeria,
          cantidad: parseInt(d.cantidad),
          porcentaje: totalArea > 0 ? parseFloat(((parseInt(d.cantidad) / totalArea) * 100).toFixed(1)) : 0
        }))
      };
    }));

    const areaDominante = rankingConDetalles.length > 0 ? rankingConDetalles[0] : null;

    return {
      ranking: rankingConDetalles,
      estadisticas: {
        totalAreas: rankingConDetalles.length,
        totalProyectos,
        areaDominante: areaDominante ? {
          nombre: areaDominante.area.nombre,
          porcentaje: areaDominante.porcentajeTotal
        } : null
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        limit
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getAreasFrecuentesGlobal:', error);
    throw error;
  }
};

/**
 * Obtener categorías más frecuentes (histórico)
 */
const getCategoriasFrecuentesGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    const limit = filtros.limit || 10;

    // Obtener ranking de categorías con conteo de proyectos
    const ranking = await sequelize.query(`
      SELECT 
        c."idCategoria",
        c."nombre" as "nombreCategoria",
        COUNT(DISTINCT p."idProyecto") as "totalProyectos"
      FROM "Categoria" c
      LEFT JOIN "AreaCategoria" ac ON ac."idCategoria" = c."idCategoria"
      LEFT JOIN "Materia" m ON m."idAreaCategoria" = ac."idAreaCategoria"
      LEFT JOIN "GrupoMateria" gm ON gm."idMateria" = m."idMateria"
      LEFT JOIN "Proyecto" p ON p."idGrupoMateria" = gm."idGrupoMateria"
      LEFT JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
      LEFT JOIN "Tarea" t ON t."idTarea" = r."idTarea"
      LEFT JOIN "Feria" f ON f."idFeria" = t."idFeria"
      WHERE f."estado" IN ('Activo', 'Finalizado')
      ${filtros.fechaInicio || filtros.fechaFin ? 'AND f."año" >= :añoInicio AND f."año" <= :añoFin' : ''}
      ${filtros.ferias && filtros.ferias.length > 0 ? 'AND f."idFeria" IN (:ferias)' : ''}
      GROUP BY c."idCategoria", c."nombre"
      ORDER BY "totalProyectos" DESC
      LIMIT :limit
    `, {
      replacements: {
        limit,
        ...(filtros.fechaInicio && { añoInicio: new Date(filtros.fechaInicio).getFullYear() }),
        ...(filtros.fechaFin && { añoFin: new Date(filtros.fechaFin).getFullYear() }),
        ...(filtros.ferias && filtros.ferias.length > 0 && { ferias: filtros.ferias })
      },
      type: sequelize.QueryTypes.SELECT
    });

    const totalProyectos = ranking.reduce((sum, r) => sum + parseInt(r.totalProyectos), 0);

    const rankingConDetalles = await Promise.all(ranking.map(async (categoria) => {
      // Obtener distribución por feria para esta categoría
      const distribucion = await sequelize.query(`
        SELECT 
          f."nombre" as "nombreFeria",
          COUNT(DISTINCT p."idProyecto") as cantidad
        FROM "Feria" f
        INNER JOIN "Tarea" t ON t."idFeria" = f."idFeria"
        INNER JOIN "Revision" r ON r."idTarea" = t."idTarea"
        INNER JOIN "Proyecto" p ON p."idProyecto" = r."idProyecto"
        INNER JOIN "GrupoMateria" gm ON gm."idGrupoMateria" = p."idGrupoMateria"
        INNER JOIN "Materia" m ON m."idMateria" = gm."idMateria"
        INNER JOIN "AreaCategoria" ac ON ac."idAreaCategoria" = m."idAreaCategoria"
        WHERE ac."idCategoria" = :idCategoria
        AND f."estado" IN ('Activo', 'Finalizado')
        GROUP BY f."idFeria", f."nombre", f."año", f."semestre"
        ORDER BY f."año" ASC, f."semestre" ASC
      `, {
        replacements: { idCategoria: categoria.idCategoria },
        type: sequelize.QueryTypes.SELECT
      });

      const totalCategoria = parseInt(categoria.totalProyectos);
      const porcentajeTotal = totalProyectos > 0 ? parseFloat(((totalCategoria / totalProyectos) * 100).toFixed(1)) : 0;

      // Calcular tendencia
      const cantidades = distribucion.map(d => parseInt(d.cantidad));
      let variacionPromedio = 0;
      if (cantidades.length > 1) {
        const variaciones = [];
        for (let i = 1; i < cantidades.length; i++) {
          if (cantidades[i - 1] > 0) {
            variaciones.push(((cantidades[i] - cantidades[i - 1]) / cantidades[i - 1]) * 100);
          }
        }
        variacionPromedio = variaciones.length > 0 
          ? parseFloat((variaciones.reduce((a, b) => a + b, 0) / variaciones.length).toFixed(1))
          : 0;
      }

      return {
        categoria: {
          idCategoria: categoria.idCategoria,
          nombre: categoria.nombreCategoria
        },
        totalProyectos: totalCategoria,
        porcentajeTotal,
        tendencia: {
          direccion: determinarTendencia(variacionPromedio),
          variacionPromedio
        },
        distribucionPorFeria: distribucion.map(d => ({
          feria: d.nombreFeria,
          cantidad: parseInt(d.cantidad),
          porcentaje: totalCategoria > 0 ? parseFloat(((parseInt(d.cantidad) / totalCategoria) * 100).toFixed(1)) : 0
        }))
      };
    }));

    const categoriaDominante = rankingConDetalles.length > 0 ? rankingConDetalles[0] : null;

    return {
      ranking: rankingConDetalles,
      estadisticas: {
        totalCategorias: rankingConDetalles.length,
        totalProyectos,
        categoriaDominante: categoriaDominante ? {
          nombre: categoriaDominante.categoria.nombre,
          porcentaje: categoriaDominante.porcentajeTotal
        } : null
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        limit
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getCategoriasFrecuentesGlobal:', error);
    throw error;
  }
};

/**
 * Comparación de tendencias entre dos ferias
 */
const getComparacionFeriasGlobal = async (filtros = {}) => {
  try {
    if (!filtros.feriaBase || !filtros.feriaComparacion) {
      throw new Error('Se requieren feriaBase y feriaComparacion');
    }

    const dimension = filtros.dimension || 'ambas';

    // Obtener información de las ferias
    const [feriaBase, feriaComparacion] = await Promise.all([
      Feria.findByPk(filtros.feriaBase, {
        attributes: ['idFeria', 'nombre', 'semestre', 'año']
      }),
      Feria.findByPk(filtros.feriaComparacion, {
        attributes: ['idFeria', 'nombre', 'semestre', 'año']
      })
    ]);

    if (!feriaBase || !feriaComparacion) {
      throw new Error('Una o ambas ferias no existen');
    }

    let comparacionPorArea = [];
    let comparacionPorCategoria = [];

    // Comparación por área
    if (dimension === 'area' || dimension === 'ambas') {
      const areasData = await sequelize.query(`
        SELECT 
          a."idArea",
          a."nombre" as "nombreArea",
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaBase THEN p."idProyecto" END) as "cantidadBase",
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaComparacion THEN p."idProyecto" END) as "cantidadComparacion"
        FROM "Area" a
        LEFT JOIN "AreaCategoria" ac ON ac."idArea" = a."idArea"
        LEFT JOIN "Materia" m ON m."idAreaCategoria" = ac."idAreaCategoria"
        LEFT JOIN "GrupoMateria" gm ON gm."idMateria" = m."idMateria"
        LEFT JOIN "Proyecto" p ON p."idGrupoMateria" = gm."idGrupoMateria"
        LEFT JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
        LEFT JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        WHERE t."idFeria" IN (:feriaBase, :feriaComparacion)
          AND t.orden = 0
        GROUP BY a."idArea", a."nombre"
        HAVING COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaBase THEN p."idProyecto" END) > 0
           OR COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaComparacion THEN p."idProyecto" END) > 0
        ORDER BY (
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaBase THEN p."idProyecto" END) + 
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaComparacion THEN p."idProyecto" END)
        ) DESC
      `, {
        replacements: {
          feriaBase: filtros.feriaBase,
          feriaComparacion: filtros.feriaComparacion
        },
        type: sequelize.QueryTypes.SELECT
      });

      comparacionPorArea = areasData.map(area => {
        const cantidadBase = parseInt(area.cantidadBase);
        const cantidadComparacion = parseInt(area.cantidadComparacion);
        const variacionAbsoluta = cantidadComparacion - cantidadBase;
        const variacionPorcentual = cantidadBase > 0 
          ? parseFloat(((variacionAbsoluta / cantidadBase) * 100).toFixed(1))
          : null;

        return {
          area: {
            idArea: area.idArea,
            nombre: area.nombreArea
          },
          feriaBase: {
            cantidad: cantidadBase,
            porcentaje: 0 // Se calculará después si es necesario
          },
          feriaComparacion: {
            cantidad: cantidadComparacion,
            porcentaje: 0
          },
          variacion: {
            absoluta: variacionAbsoluta,
            porcentual: variacionPorcentual,
            tipo: variacionAbsoluta >= 0 ? 'incremento' : 'decremento'
          }
        };
      });
    }

    // Comparación por categoría
    if (dimension === 'categoria' || dimension === 'ambas') {
      const categoriasData = await sequelize.query(`
        SELECT 
          c."idCategoria",
          c."nombre" as "nombreCategoria",
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaBase THEN p."idProyecto" END) as "cantidadBase",
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaComparacion THEN p."idProyecto" END) as "cantidadComparacion"
        FROM "Categoria" c
        LEFT JOIN "AreaCategoria" ac ON ac."idCategoria" = c."idCategoria"
        LEFT JOIN "Materia" m ON m."idAreaCategoria" = ac."idAreaCategoria"
        LEFT JOIN "GrupoMateria" gm ON gm."idMateria" = m."idMateria"
        LEFT JOIN "Proyecto" p ON p."idGrupoMateria" = gm."idGrupoMateria"
        LEFT JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
        LEFT JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        WHERE t."idFeria" IN (:feriaBase, :feriaComparacion)
          AND t.orden = 0
        GROUP BY c."idCategoria", c."nombre"
        HAVING COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaBase THEN p."idProyecto" END) > 0
           OR COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaComparacion THEN p."idProyecto" END) > 0
        ORDER BY (
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaBase THEN p."idProyecto" END) + 
          COUNT(DISTINCT CASE WHEN t."idFeria" = :feriaComparacion THEN p."idProyecto" END)
        ) DESC
      `, {
        replacements: {
          feriaBase: filtros.feriaBase,
          feriaComparacion: filtros.feriaComparacion
        },
        type: sequelize.QueryTypes.SELECT
      });

      comparacionPorCategoria = categoriasData.map(categoria => {
        const cantidadBase = parseInt(categoria.cantidadBase);
        const cantidadComparacion = parseInt(categoria.cantidadComparacion);
        const variacionAbsoluta = cantidadComparacion - cantidadBase;
        const variacionPorcentual = cantidadBase > 0 
          ? parseFloat(((variacionAbsoluta / cantidadBase) * 100).toFixed(1))
          : null;

        return {
          categoria: {
            idCategoria: categoria.idCategoria,
            nombre: categoria.nombreCategoria
          },
          feriaBase: {
            cantidad: cantidadBase,
            porcentaje: 0
          },
          feriaComparacion: {
            cantidad: cantidadComparacion,
            porcentaje: 0
          },
          variacion: {
            absoluta: variacionAbsoluta,
            porcentual: variacionPorcentual,
            tipo: variacionAbsoluta >= 0 ? 'incremento' : 'decremento'
          }
        };
      });
    }

    // Calcular resumen
    const areasConMayorCrecimiento = comparacionPorArea
      .filter(a => a.variacion.tipo === 'incremento' && a.variacion.porcentual !== null)
      .sort((a, b) => b.variacion.porcentual - a.variacion.porcentual)
      .slice(0, 3)
      .map(a => ({ nombre: a.area.nombre, variacion: a.variacion.porcentual }));

    const areasConMayorDecrecimiento = comparacionPorArea
      .filter(a => a.variacion.tipo === 'decremento' && a.variacion.porcentual !== null)
      .sort((a, b) => a.variacion.porcentual - b.variacion.porcentual)
      .slice(0, 3)
      .map(a => ({ nombre: a.area.nombre, variacion: Math.abs(a.variacion.porcentual) }));

    const categoriasConMayorCrecimiento = comparacionPorCategoria
      .filter(c => c.variacion.tipo === 'incremento' && c.variacion.porcentual !== null)
      .sort((a, b) => b.variacion.porcentual - a.variacion.porcentual)
      .slice(0, 3)
      .map(c => ({ nombre: c.categoria.nombre, variacion: c.variacion.porcentual }));

    const categoriasConMayorDecrecimiento = comparacionPorCategoria
      .filter(c => c.variacion.tipo === 'decremento' && c.variacion.porcentual !== null)
      .sort((a, b) => a.variacion.porcentual - b.variacion.porcentual)
      .slice(0, 3)
      .map(c => ({ nombre: c.categoria.nombre, variacion: Math.abs(c.variacion.porcentual) }));

    return {
      feriaBase: {
        idFeria: feriaBase.idFeria,
        nombre: feriaBase.nombre,
        semestre: feriaBase.semestre,
        año: feriaBase.año
      },
      feriaComparacion: {
        idFeria: feriaComparacion.idFeria,
        nombre: feriaComparacion.nombre,
        semestre: feriaComparacion.semestre,
        año: feriaComparacion.año
      },
      ...(dimension === 'area' || dimension === 'ambas' ? { comparacionPorArea } : {}),
      ...(dimension === 'categoria' || dimension === 'ambas' ? { comparacionPorCategoria } : {}),
      resumen: {
        areasConMayorCrecimiento,
        areasConMayorDecrecimiento,
        categoriasConMayorCrecimiento,
        categoriasConMayorDecrecimiento
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getComparacionFeriasGlobal:', error);
    throw error;
  }
};

// ============================================
// REPORTES GLOBALES - RENDIMIENTO ACADÉMICO
// ============================================

/**
 * Obtener promedio general por feria (rendimiento académico)
 */
const getPromediosPorFeriaGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    // Obtener ferias ordenadas cronológicamente
    const ferias = await Feria.findAll({
      where: whereFeria,
      order: [['año', 'ASC'], ['semestre', 'ASC']],
      attributes: ['idFeria', 'nombre', 'semestre', 'año']
    });

    const series = [];
    let promedioAnterior = null;
    const todosPromedios = [];

    for (const feria of ferias) {
      // Obtener calificaciones totales por proyecto (promedio de jurados)
      const calificaciones = await sequelize.query(`
        SELECT AVG(calificaciones_jurado."puntajeTotal") as "puntajeTotal"
        FROM (
          SELECT 
            dp."idProyecto",
            dp."idDocenteProyecto",
            SUM(c."puntajeObtenido") as "puntajeTotal"
          FROM "Calificacion" c
          INNER JOIN "DocenteProyecto" dp ON dp."idDocenteProyecto" = c."idDocenteProyecto"
          INNER JOIN "Proyecto" p ON p."idProyecto" = dp."idProyecto"
          INNER JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
          INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
          ${filtros.areaId || filtros.categoriaId ? `
          INNER JOIN "GrupoMateria" gm ON gm."idGrupoMateria" = p."idGrupoMateria"
          INNER JOIN "Materia" m ON m."idMateria" = gm."idMateria"
          INNER JOIN "AreaCategoria" ac ON ac."idAreaCategoria" = m."idAreaCategoria"
          ` : ''}
          WHERE t."idFeria" = :idFeria
          AND t."orden" = 0
          AND c."calificado" = true
          ${filtros.areaId ? 'AND ac."idArea" = :idArea' : ''}
          ${filtros.categoriaId ? 'AND ac."idCategoria" = :idCategoria' : ''}
          GROUP BY dp."idProyecto", dp."idDocenteProyecto"
        ) calificaciones_jurado
        GROUP BY calificaciones_jurado."idProyecto"
      `, {
        replacements: {
          idFeria: feria.idFeria,
          ...(filtros.areaId && { idArea: filtros.areaId }),
          ...(filtros.categoriaId && { idCategoria: filtros.categoriaId })
        },
        type: sequelize.QueryTypes.SELECT
      });

      // Obtener el puntaje máximo total de la feria (suma de todos los maximoPuntaje de subcalificaciones)
      const puntajeMaximoResult = await sequelize.query(`
        SELECT SUM(sc."maximoPuntaje") as "puntajeMaximo"
        FROM "Feria" f
        INNER JOIN "TipoCalificacion" tc ON tc."idTipoCalificacion" = f."idTipoCalificacion"
        INNER JOIN "SubCalificacion" sc ON sc."idTipoCalificacion" = tc."idTipoCalificacion"
        WHERE f."idFeria" = :idFeria
      `, {
        replacements: { idFeria: feria.idFeria },
        type: sequelize.QueryTypes.SELECT
      });

      const puntajeMaximo = parseFloat(puntajeMaximoResult[0]?.puntajeMaximo || 100);
      console.log('🔍 DEBUG - Puntaje máximo total:', puntajeMaximo);

      // Normalizar puntajes a escala de 100
      const puntajes = calificaciones.map(c => {
        const puntajeRaw = parseFloat(c.puntajeTotal);
        const puntajeNormalizado = (puntajeRaw / puntajeMaximo) * 100;
        return parseFloat(puntajeNormalizado.toFixed(2));
      });

      console.log('🔍 DEBUG - Primeros 3 puntajes normalizados:', puntajes.slice(0, 3));
      
      if (puntajes.length === 0) {
        series.push({
          feria: {
            idFeria: feria.idFeria,
            nombre: feria.nombre,
            semestre: feria.semestre,
            año: feria.año
          },
          estadisticas: {
            promedioGeneral: 0,
            mediana: 0,
            desviacionEstandar: 0,
            calificacionMaxima: 0,
            calificacionMinima: 0,
            totalProyectosCalificados: 0
          },
          distribucionPorRango: [
            { rango: "0-60", cantidad: 0, porcentaje: 0 },
            { rango: "61-80", cantidad: 0, porcentaje: 0 },
            { rango: "81-100", cantidad: 0, porcentaje: 0 }
          ],
          variacion: null
        });
        continue;
      }

      // Calcular estadísticas
      const promedioGeneral = parseFloat((puntajes.reduce((a, b) => a + b, 0) / puntajes.length).toFixed(2));
      const puntajesOrdenados = [...puntajes].sort((a, b) => a - b);
      const mediana = puntajesOrdenados.length % 2 === 0
        ? (puntajesOrdenados[puntajesOrdenados.length / 2 - 1] + puntajesOrdenados[puntajesOrdenados.length / 2]) / 2
        : puntajesOrdenados[Math.floor(puntajesOrdenados.length / 2)];
      
      const varianza = puntajes.reduce((sum, val) => sum + Math.pow(val - promedioGeneral, 2), 0) / puntajes.length;
      const desviacionEstandar = parseFloat(Math.sqrt(varianza).toFixed(2));

      // Distribución por rangos
      const rango0_60 = puntajes.filter(p => p <= 60).length;
      const rango61_80 = puntajes.filter(p => p > 60 && p <= 80).length;
      const rango81_100 = puntajes.filter(p => p > 80).length;

      const distribucionPorRango = [
        { rango: "0-60", cantidad: rango0_60, porcentaje: parseFloat(((rango0_60 / puntajes.length) * 100).toFixed(1)) },
        { rango: "61-80", cantidad: rango61_80, porcentaje: parseFloat(((rango61_80 / puntajes.length) * 100).toFixed(1)) },
        { rango: "81-100", cantidad: rango81_100, porcentaje: parseFloat(((rango81_100 / puntajes.length) * 100).toFixed(1)) }
      ];

      // Variación respecto a feria anterior
      const variacion = promedioAnterior !== null
        ? calcularCrecimiento(promedioGeneral, promedioAnterior)
        : null;

      series.push({
        feria: {
          idFeria: feria.idFeria,
          nombre: feria.nombre,
          semestre: feria.semestre,
          año: feria.año
        },
        estadisticas: {
          promedioGeneral,
          mediana: parseFloat(mediana.toFixed(2)),
          desviacionEstandar,
          calificacionMaxima: parseFloat(Math.max(...puntajes).toFixed(2)),
          calificacionMinima: parseFloat(Math.min(...puntajes).toFixed(2)),
          totalProyectosCalificados: puntajes.length
        },
        distribucionPorRango,
        variacion
      });

      todosPromedios.push(promedioGeneral);
      promedioAnterior = promedioGeneral;
    }

    // Calcular tendencia general
    const promedioHistorico = todosPromedios.length > 0
      ? parseFloat((todosPromedios.reduce((a, b) => a + b, 0) / todosPromedios.length).toFixed(2))
      : 0;

    let tasaCrecimientoPromedio = 0;
    if (todosPromedios.length > 1) {
      const tasas = [];
      for (let i = 1; i < todosPromedios.length; i++) {
        if (todosPromedios[i - 1] > 0) {
          tasas.push(((todosPromedios[i] - todosPromedios[i - 1]) / todosPromedios[i - 1]) * 100);
        }
      }
      tasaCrecimientoPromedio = tasas.length > 0
        ? parseFloat((tasas.reduce((a, b) => a + b, 0) / tasas.length).toFixed(2))
        : 0;
    }

    return {
      series,
      tendenciaGeneral: {
        direccion: determinarTendencia(tasaCrecimientoPromedio),
        tasaCrecimientoPromedio,
        promedioHistorico
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        areaId: filtros.areaId || null,
        categoriaId: filtros.categoriaId || null
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getPromediosPorFeriaGlobal:', error);
    throw error;
  }
};

/**
 * Obtener ranking de áreas por rendimiento académico
 */
const getRankingAreasRendimientoGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    const limit = filtros.limit || 10;
    const orderBy = filtros.orderBy || 'promedio';

    // Obtener estadísticas por área (calificaciones totales por proyecto)
    const areasData = await sequelize.query(`
      SELECT 
        a."idArea",
        a."nombre" as "nombreArea",
        AVG(calificaciones_totales."puntajeTotal") as "promedioHistorico",
        STDDEV(calificaciones_totales."puntajeTotal") as "desviacionEstandar",
        COUNT(DISTINCT calificaciones_totales."idProyecto") as "totalProyectos",
        COUNT(DISTINCT calificaciones_totales."idFeria") as "totalFerias"
      FROM "Area" a
      INNER JOIN "AreaCategoria" ac ON ac."idArea" = a."idArea"
      INNER JOIN "Materia" m ON m."idAreaCategoria" = ac."idAreaCategoria"
      INNER JOIN "GrupoMateria" gm ON gm."idMateria" = m."idMateria"
      INNER JOIN "Proyecto" p ON p."idGrupoMateria" = gm."idGrupoMateria"
      INNER JOIN (
        SELECT 
          dp."idDocenteProyecto",
          dp."idProyecto",
          t."idFeria",
          SUM(c."puntajeObtenido") as "puntajeTotal"
        FROM "DocenteProyecto" dp
        INNER JOIN "Calificacion" c ON c."idDocenteProyecto" = dp."idDocenteProyecto"
        INNER JOIN "Proyecto" p2 ON p2."idProyecto" = dp."idProyecto"
        INNER JOIN "Revision" r ON r."idProyecto" = p2."idProyecto"
        INNER JOIN "Tarea" t ON t."idTarea" = r."idTarea"
        INNER JOIN "Feria" f ON f."idFeria" = t."idFeria"
        WHERE f."estado" IN ('Activo', 'Finalizado')
        AND t."orden" = 0
        AND c."calificado" = true
        ${filtros.fechaInicio || filtros.fechaFin ? 'AND f."año" >= :añoInicio AND f."año" <= :añoFin' : ''}
        ${filtros.ferias && filtros.ferias.length > 0 ? 'AND f."idFeria" IN (:ferias)' : ''}
        GROUP BY dp."idDocenteProyecto", dp."idProyecto", t."idFeria"
      ) calificaciones_totales ON calificaciones_totales."idProyecto" = p."idProyecto"
      GROUP BY a."idArea", a."nombre"
      HAVING COUNT(DISTINCT p."idProyecto") > 0
      ORDER BY ${orderBy === 'consistencia' ? '"desviacionEstandar" ASC' : '"promedioHistorico" DESC'}
      LIMIT :limit
    `, {
      replacements: {
        limit,
        ...(filtros.fechaInicio && { añoInicio: new Date(filtros.fechaInicio).getFullYear() }),
        ...(filtros.fechaFin && { añoFin: new Date(filtros.fechaFin).getFullYear() }),
        ...(filtros.ferias && filtros.ferias.length > 0 && { ferias: filtros.ferias })
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Obtener evolución por feria para cada área
    const ranking = await Promise.all(areasData.map(async (area, index) => {
      const evolucion = await sequelize.query(`
        SELECT 
          f."nombre" as "nombreFeria",
          AVG(calificaciones_totales."puntajeTotal") as promedio
        FROM "Feria" f
        INNER JOIN "Tarea" t ON t."idFeria" = f."idFeria"
        INNER JOIN "Revision" r ON r."idTarea" = t."idTarea"
        INNER JOIN "Proyecto" p ON p."idProyecto" = r."idProyecto"
        INNER JOIN "GrupoMateria" gm ON gm."idGrupoMateria" = p."idGrupoMateria"
        INNER JOIN "Materia" m ON m."idMateria" = gm."idMateria"
        INNER JOIN "AreaCategoria" ac ON ac."idAreaCategoria" = m."idAreaCategoria"
        INNER JOIN (
          SELECT 
            dp."idDocenteProyecto",
            dp."idProyecto",
            SUM(c."puntajeObtenido") as "puntajeTotal"
          FROM "DocenteProyecto" dp
          INNER JOIN "Calificacion" c ON c."idDocenteProyecto" = dp."idDocenteProyecto"
          INNER JOIN "Proyecto" p2 ON p2."idProyecto" = dp."idProyecto"
          INNER JOIN "Revision" r2 ON r2."idProyecto" = p2."idProyecto"
          INNER JOIN "Tarea" t2 ON t2."idTarea" = r2."idTarea"
          WHERE c."calificado" = true
          AND t2."orden" = 0
          GROUP BY dp."idDocenteProyecto", dp."idProyecto"
        ) calificaciones_totales ON calificaciones_totales."idProyecto" = p."idProyecto"
        WHERE ac."idArea" = :idArea
        AND f."estado" IN ('Activo', 'Finalizado')
        GROUP BY f."idFeria", f."nombre", f."año", f."semestre"
        ORDER BY f."año" ASC, f."semestre" ASC
      `, {
        replacements: { idArea: area.idArea },
        type: sequelize.QueryTypes.SELECT
      });

      // Calcular mediana
      const promedios = evolucion.map(e => parseFloat(e.promedio));
      const promediosOrdenados = [...promedios].sort((a, b) => a - b);
      const mediana = promediosOrdenados.length > 0
        ? (promediosOrdenados.length % 2 === 0
          ? (promediosOrdenados[promediosOrdenados.length / 2 - 1] + promediosOrdenados[promediosOrdenados.length / 2]) / 2
          : promediosOrdenados[Math.floor(promediosOrdenados.length / 2)])
        : 0;

      // Calcular tendencia
      let variacionPromedio = 0;
      if (promedios.length > 1) {
        const variaciones = [];
        for (let i = 1; i < promedios.length; i++) {
          if (promedios[i - 1] > 0) {
            variaciones.push(((promedios[i] - promedios[i - 1]) / promedios[i - 1]) * 100);
          }
        }
        variacionPromedio = variaciones.length > 0
          ? parseFloat((variaciones.reduce((a, b) => a + b, 0) / variaciones.length).toFixed(2))
          : 0;
      }

      return {
        posicion: index + 1,
        area: {
          idArea: area.idArea,
          nombre: area.nombreArea
        },
        estadisticas: {
          promedioHistorico: parseFloat(area.promedioHistorico).toFixed(2),
          mediana: parseFloat(mediana.toFixed(2)),
          desviacionEstandar: parseFloat(area.desviacionEstandar || 0).toFixed(2),
          totalProyectos: parseInt(area.totalProyectos),
          totalFerias: parseInt(area.totalFerias)
        },
        evolucion: evolucion.map(e => ({
          feria: e.nombreFeria,
          promedio: parseFloat(e.promedio).toFixed(2)
        })),
        tendencia: {
          direccion: determinarTendencia(variacionPromedio),
          variacionPromedio
        }
      };
    }));

    // Estadísticas generales
    const promedioGeneral = areasData.length > 0
      ? parseFloat((areasData.reduce((sum, a) => sum + parseFloat(a.promedioHistorico), 0) / areasData.length).toFixed(2))
      : 0;

    const areaMejorRendimiento = ranking.length > 0 ? ranking[0] : null;
    const areaMasConsistente = [...ranking].sort((a, b) => 
      parseFloat(a.estadisticas.desviacionEstandar) - parseFloat(b.estadisticas.desviacionEstandar)
    )[0] || null;

    return {
      ranking,
      estadisticasGenerales: {
        totalAreas: ranking.length,
        promedioGeneral,
        areaMejorRendimiento: areaMejorRendimiento ? {
          nombre: areaMejorRendimiento.area.nombre,
          promedio: areaMejorRendimiento.estadisticas.promedioHistorico
        } : null,
        areaMasConsistente: areaMasConsistente ? {
          nombre: areaMasConsistente.area.nombre,
          desviacionEstandar: areaMasConsistente.estadisticas.desviacionEstandar
        } : null
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        limit,
        orderBy
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getRankingAreasRendimientoGlobal:', error);
    throw error;
  }
};

// ============================================
// REPORTES GLOBALES - MATRIZ ÁREA VS CATEGORÍA
// ============================================

/**
 * Obtener matriz de área vs categoría (heatmap)
 */
const getMatrizAreaCategoriaGlobal = async (filtros = {}) => {
  try {
    const whereFeria = aplicarFiltrosGlobales(filtros);
    whereFeria.estado = {
      [Op.in]: ['Activo', 'Finalizado']
    };

    const metrica = filtros.metrica || 'ambas';

    // Obtener datos de la matriz: conteo y promedio por área-categoría
    const matrizData = await sequelize.query(`
      SELECT 
        a."idArea",
        a."nombre" as "nombreArea",
        c."idCategoria",
        c."nombre" as "nombreCategoria",
        COUNT(DISTINCT calificaciones_proyecto."idProyecto") as "totalProyectos",
        AVG(calificaciones_proyecto."promedioProyecto") as "promedioCalificacion"
      FROM "Area" a
      CROSS JOIN "Categoria" c
      LEFT JOIN "AreaCategoria" ac ON ac."idArea" = a."idArea" AND ac."idCategoria" = c."idCategoria"
      LEFT JOIN "Materia" m ON m."idAreaCategoria" = ac."idAreaCategoria"
      LEFT JOIN "GrupoMateria" gm ON gm."idMateria" = m."idMateria"
      LEFT JOIN "Proyecto" p ON p."idGrupoMateria" = gm."idGrupoMateria"
      LEFT JOIN "Revision" r ON r."idProyecto" = p."idProyecto"
      LEFT JOIN "Tarea" t ON t."idTarea" = r."idTarea"
      LEFT JOIN "Feria" f ON f."idFeria" = t."idFeria"
      LEFT JOIN (
        SELECT 
          calificaciones_jurado."idProyecto",
          AVG(calificaciones_jurado."puntajeTotal") as "promedioProyecto"
        FROM (
          SELECT 
            dp2."idProyecto",
            dp2."idDocenteProyecto",
            SUM(cal."puntajeObtenido") as "puntajeTotal"
          FROM "DocenteProyecto" dp2
          INNER JOIN "Calificacion" cal ON cal."idDocenteProyecto" = dp2."idDocenteProyecto"
          INNER JOIN "Proyecto" p2 ON p2."idProyecto" = dp2."idProyecto"
          INNER JOIN "Revision" r2 ON r2."idProyecto" = p2."idProyecto"
          INNER JOIN "Tarea" t2 ON t2."idTarea" = r2."idTarea"
          WHERE cal."calificado" = true
          AND t2."orden" = 0
          GROUP BY dp2."idProyecto", dp2."idDocenteProyecto"
        ) calificaciones_jurado
        GROUP BY calificaciones_jurado."idProyecto"
      ) calificaciones_proyecto ON calificaciones_proyecto."idProyecto" = p."idProyecto"
      WHERE (f."estado" IN ('Activo', 'Finalizado') OR f."estado" IS NULL)
      ${filtros.fechaInicio || filtros.fechaFin ? 'AND (f."año" >= :añoInicio AND f."año" <= :añoFin OR f."año" IS NULL)' : ''}
      ${filtros.ferias && filtros.ferias.length > 0 ? 'AND (f."idFeria" IN (:ferias) OR f."idFeria" IS NULL)' : ''}
      AND t."orden" = 0 OR t."orden" IS NULL
      GROUP BY a."idArea", a."nombre", c."idCategoria", c."nombre"
      ORDER BY a."nombre" ASC, c."nombre" ASC
    `, {
      replacements: {
        ...(filtros.fechaInicio && { añoInicio: new Date(filtros.fechaInicio).getFullYear() }),
        ...(filtros.fechaFin && { añoFin: new Date(filtros.fechaFin).getFullYear() }),
        ...(filtros.ferias && filtros.ferias.length > 0 && { ferias: filtros.ferias })
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Calcular totales por área y categoría
    const totalesPorArea = new Map();
    const totalesPorCategoria = new Map();
    let totalGeneral = 0;

    matrizData.forEach(row => {
      const proyectos = parseInt(row.totalProyectos) || 0;
      const promedio = parseFloat(row.promedioCalificacion) || 0;

      // Totales por área
      if (!totalesPorArea.has(row.idArea)) {
        totalesPorArea.set(row.idArea, {
          totalProyectos: 0,
          sumaPromedios: 0,
          contadorPromedios: 0
        });
      }
      const areaData = totalesPorArea.get(row.idArea);
      areaData.totalProyectos += proyectos;
      if (promedio > 0) {
        areaData.sumaPromedios += promedio * proyectos;
        areaData.contadorPromedios += proyectos;
      }

      // Totales por categoría
      if (!totalesPorCategoria.has(row.idCategoria)) {
        totalesPorCategoria.set(row.idCategoria, {
          nombre: row.nombreCategoria,
          totalProyectos: 0,
          sumaPromedios: 0,
          contadorPromedios: 0
        });
      }
      const catData = totalesPorCategoria.get(row.idCategoria);
      catData.totalProyectos += proyectos;
      if (promedio > 0) {
        catData.sumaPromedios += promedio * proyectos;
        catData.contadorPromedios += proyectos;
      }

      totalGeneral += proyectos;
    });

    // Construir matriz agrupada por área
    const areasMap = new Map();
    matrizData.forEach(row => {
      if (!areasMap.has(row.idArea)) {
        areasMap.set(row.idArea, {
          area: {
            idArea: row.idArea,
            nombre: row.nombreArea
          },
          categorias: []
        });
      }

      const proyectos = parseInt(row.totalProyectos) || 0;
      const promedio = parseFloat(row.promedioCalificacion) || 0;
      const areaTotal = totalesPorArea.get(row.idArea).totalProyectos;
      const categoriaTotal = totalesPorCategoria.get(row.idCategoria).totalProyectos;

      areasMap.get(row.idArea).categorias.push({
        categoria: {
          idCategoria: row.idCategoria,
          nombre: row.nombreCategoria
        },
        metricas: {
          totalProyectos: proyectos,
          promedioCalificacion: promedio > 0 ? parseFloat(promedio.toFixed(2)) : null,
          porcentajeDelArea: areaTotal > 0 ? parseFloat(((proyectos / areaTotal) * 100).toFixed(1)) : 0,
          porcentajeDeLaCategoria: categoriaTotal > 0 ? parseFloat(((proyectos / categoriaTotal) * 100).toFixed(1)) : 0
        }
      });
    });

    // Agregar totales por área
    const matriz = Array.from(areasMap.values()).map(areaObj => {
      const areaData = totalesPorArea.get(areaObj.area.idArea);
      return {
        ...areaObj,
        totales: {
          totalProyectos: areaData.totalProyectos,
          promedioArea: areaData.contadorPromedios > 0 
            ? parseFloat((areaData.sumaPromedios / areaData.contadorPromedios).toFixed(2))
            : null
        }
      };
    });

    // Totales por categoría
    const totalesPorCategoriaArray = Array.from(totalesPorCategoria.entries()).map(([id, data]) => ({
      categoria: data.nombre,
      totalProyectos: data.totalProyectos,
      promedioCalificacion: data.contadorPromedios > 0
        ? parseFloat((data.sumaPromedios / data.contadorPromedios).toFixed(2))
        : null
    }));

    return {
      matriz,
      totalesPorCategoria: totalesPorCategoriaArray,
      estadisticasGenerales: {
        totalProyectos: totalGeneral,
        totalAreas: areasMap.size,
        totalCategorias: totalesPorCategoria.size
      },
      filtros: {
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        ferias: filtros.ferias || [],
        metrica
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getMatrizAreaCategoriaGlobal:', error);
    throw error;
  }
};

// ============================================
// EXPORTAR MÓDULO
// ============================================

// Assuming 'router' and 'reportsController' are defined elsewhere,
// for example, in an Express setup.
// This change implies a transformation of the file's purpose.

// Example of how this might fit into an Express router setup:
// const express = require('express');
// const router = express.Router();
// const reportsController = {
//   getFeriaActual,
//   getTarea0,
//   buildProyectosFeriaQuery,
//   getProyectosInscritos,
//   getEstudiantesParticipantes,
//   getTutores,
//   getJurados,
//   getEventosRealizados,
//   getPorcentajeAprobadosTutor,
//   getPorcentajeAprobadosAdmin,
//   getPorcentajeAprobadosExposicion,
//   getProyectosPorEstado,
//   getParticipacionAreaCategoria,
//   getCargaDesempenoJurados,
//   getCalificacionesFeria,
//   getParticipacionEventos,
//   getFeriaActualInfo,
//   getProyectosPorFeriaGlobal,
//   getEstudiantesPorFeriaGlobal,
//   getJuradosPorFeriaGlobal,
//   getTutoresPorFeriaGlobal,
//   getAreasFrecuentesGlobal,
//   getCategoriasFrecuentesGlobal,
//   getComparacionFeriasGlobal,
//   getPromediosPorFeriaGlobal,
//   getRankingAreasRendimientoGlobal,
//   getMatrizAreaCategoriaGlobal,
// };

// ============================================
// REPORTES GLOBALES - MATRIZ ÁREA VS CATEGORÍA
// ============================================

// Matriz: Área vs Categoría (Heatmap)
// router.get(
//   "/global/matriz/area-categoria",
//   reportsController.getMatrizAreaCategoriaGlobal
// );

// module.exports = router;

// Original module.exports structure (assuming this file is a service/utility)
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

  // ============================================
  // REPORTES GLOBALES
  // ============================================
  
  // KPIs Globales
  getProyectosPorFeriaGlobal,
  getEstudiantesPorFeriaGlobal,
  getJuradosPorFeriaGlobal,
  getTutoresPorFeriaGlobal,

  // Tendencias Globales
  getAreasFrecuentesGlobal,
  getCategoriasFrecuentesGlobal,
  getComparacionFeriasGlobal,

  // Rendimiento Académico Global
  getPromediosPorFeriaGlobal,
  getRankingAreasRendimientoGlobal,

  // Matriz Área vs Categoría
  getMatrizAreaCategoriaGlobal,
};

// ============================================
// REPORTES DESCARGABLES - FERIA ACTUAL
// ============================================

/**
 * Control de Notas: Matriz de proyectos x tareas con calificaciones
 * Devuelve una matriz donde:
 * - Filas: Proyectos de la feria actual
 * - Columnas: Tareas de la feria actual
 * - Celdas: Estado de revisión (calificación, pendiente, no enviado)
 */
const getControlNotasFeriaActual = async (filtros = {}) => {
  try {
    // 1. Obtener feria actual
    const feria = await getFeriaActual();

    // 2. Obtener todas las tareas de la feria (ordenadas por orden)
    const tareas = await Tarea.findAll({
      where: { idFeria: feria.idFeria },
      order: [["orden", "ASC"]],
      attributes: ["idTarea", "orden", "nombre", "descripcion", "fechaCreacion", "fechaActualizacion"],
    });

    // 3. Obtener todos los proyectos con sus relaciones
    const proyectos = await Proyecto.findAll({
      include: [
        {
          model: GrupoMateria,
          as: "grupoMateria",
          required: false,
          where: filtros.grupoMateriaId ? { idGrupoMateria: filtros.grupoMateriaId } : {},
          include: [
            {
              model: Materia,
              as: "materia",
              required: false,
              where: filtros.materiaId ? { idMateria: filtros.materiaId } : {},
              include: [
                {
                  model: Semestre,
                  as: "semestre",
                  required: false,
                  where: filtros.semestreId ? { idSemestre: filtros.semestreId } : {},
                },
                {
                  model: AreaCategoria,
                  as: "areaCategoria",
                  required: filtros.areaId || filtros.categoriaId ? true : false,
                  where: filtros.areaId || filtros.categoriaId ? {
                    ...(filtros.areaId && { idArea: filtros.areaId }),
                    ...(filtros.categoriaId && { idCategoria: filtros.categoriaId }),
                  } : {},
                  include: [
                    {
                      model: Area,
                      as: "area",
                      attributes: ["idArea", "nombre"],
                    },
                    {
                      model: Categoria,
                      as: "categoria",
                      attributes: ["idCategoria", "nombre"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Revision,
          as: "revisiones",
          required: false,
          include: [
            {
              model: Tarea,
              as: "tarea",
              attributes: ["idTarea", "orden", "nombre"],
            },
          ],
        },
      ],
      attributes: ["idProyecto", "nombre", "descripcion", "fechaCreacion", "estaAprobado", "estaAprobadoTutor", "esFinal"],
      order: [["nombre", "ASC"]],
    });

    console.log('=== DEBUG CONTROL NOTAS ===');
    console.log('Feria actual:', feria.idFeria, feria.nombre);
    console.log('Total proyectos obtenidos:', proyectos.length);
    console.log('IDs de tareas de esta feria:', tareas.map(t => t.idTarea));
    
    proyectos.forEach((p, index) => {
      const tareasDelProyecto = p.revisiones?.map(r => r.idTarea) || [];
      const tieneRevisionDeFeria = p.revisiones?.some(r => 
        tareas.some(t => t.idTarea === r.idTarea)
      );
      
      console.log(`\nProyecto ${index + 1}:`, {
        id: p.idProyecto,
        nombre: p.nombre,
        totalRevisiones: p.revisiones?.length || 0,
        tareasDelProyecto,
        tieneRevisionDeFeria,
      });
    });

    // Filtrar proyectos que tienen al menos una revisión de una tarea de la feria actual
    const proyectosFiltrados = proyectos.filter(proyecto => {
      // Un proyecto pertenece a la feria si tiene al menos una revisión de una tarea de esa feria
      return proyecto.revisiones?.some(revision => 
        tareas.some(tarea => tarea.idTarea === revision.idTarea)
      );
    });

    console.log('\nProyectos filtrados:', proyectosFiltrados.length);
    console.log('=== FIN DEBUG ===\n');

    // 5. Construir la matriz
    const matriz = proyectosFiltrados.map((proyecto) => {
      // Crear un mapa de revisiones por tarea para acceso rápido
      const revisionesPorTarea = {};
      proyecto.revisiones.forEach((revision) => {
        if (revision.tarea) {
          revisionesPorTarea[revision.tarea.idTarea] = revision;
        }
      });

      // Construir el estado de cada tarea
      const tareasEstado = tareas.map((tarea) => {
        const revision = revisionesPorTarea[tarea.idTarea];

        if (!revision) {
          // No se ha enviado la tarea
          return {
            idTarea: tarea.idTarea,
            ordenTarea: tarea.orden,
            nombreTarea: tarea.nombre,
            estado: "no_enviado",
            calificacion: null,
            comentario: null,
            fechaEnvio: null,
            fechaRevision: null,
          };
        }

        if (!revision.revisado) {
          // Se envió pero no fue revisado
          return {
            idTarea: tarea.idTarea,
            ordenTarea: tarea.orden,
            nombreTarea: tarea.nombre,
            estado: "pendiente_revision",
            calificacion: null,
            comentario: revision.comentario || null,
            fechaEnvio: revision.fechaCreacion,
            fechaRevision: null,
          };
        }

        // Fue revisado y tiene calificación
        return {
          idTarea: tarea.idTarea,
          ordenTarea: tarea.orden,
          nombreTarea: tarea.nombre,
          estado: "revisado",
          calificacion: revision.puntaje,
          comentario: revision.comentario || null,
          fechaEnvio: revision.fechaCreacion,
          fechaRevision: revision.fechaActualizacion,
        };
      });

      return {
        proyecto: {
          idProyecto: proyecto.idProyecto,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          fechaCreacion: proyecto.fechaCreacion,
          estaAprobado: proyecto.estaAprobado,
          estaAprobadoTutor: proyecto.estaAprobadoTutor,
          esFinal: proyecto.esFinal,
          area: proyecto.grupoMateria?.materia?.areaCategoria?.area?.nombre || null,
          categoria: proyecto.grupoMateria?.materia?.areaCategoria?.categoria?.nombre || null,
        },
        tareas: tareasEstado,
      };
    });

    // 6. Calcular estadísticas generales
    const estadisticas = {
      totalProyectos: proyectosFiltrados.length,
      totalTareas: tareas.length,
      tareasRevisadas: 0,
      tareasPendientes: 0,
      tareasNoEnviadas: 0,
    };

    matriz.forEach((fila) => {
      fila.tareas.forEach((tarea) => {
        if (tarea.estado === "revisado") estadisticas.tareasRevisadas++;
        else if (tarea.estado === "pendiente_revision") estadisticas.tareasPendientes++;
        else if (tarea.estado === "no_enviado") estadisticas.tareasNoEnviadas++;
      });
    });

    return {
      feria: {
        idFeria: feria.idFeria,
        nombre: feria.nombre,
        estado: feria.estado,
      },
      tareas: tareas.map((t) => ({
        idTarea: t.idTarea,
        orden: t.orden,
        nombre: t.nombre,
        descripcion: t.descripcion,
        fechaCreacion: t.fechaCreacion,
        fechaActualizacion: t.fechaActualizacion,
      })),
      matriz,
      estadisticas,
      filtros: {
        areaId: filtros.areaId || null,
        categoriaId: filtros.categoriaId || null,
        grupoMateriaId: filtros.grupoMateriaId || null,
        materiaId: filtros.materiaId || null,
        semestreId: filtros.semestreId || null,
      },
    };
  } catch (error) {
    console.error("Error en getControlNotasFeriaActual:", error);
    throw error;
  }
};

/**
 * Reporte: Proyectos con Jurados Asignados
 * Obtiene todos los proyectos aprobados para exposición (esFinal === true)
 * con sus jurados asignados (hasta 3)
 */
const getProyectosJuradosFeriaActual = async () => {
  try {
    const feriaActual = await getFeriaActual();
    const tarea0 = await getTarea0(feriaActual.idFeria);

    // Obtener proyectos aprobados para exposición
    const revisiones = await Revision.findAll({
      where: { idTarea: tarea0.idTarea },
      attributes: ['idProyecto'],
      include: [
        {
          model: Proyecto,
          as: 'proyecto',
          required: true,
          where: { esFinal: true }, // Solo proyectos aprobados para exposición
          attributes: ['idProyecto', 'nombre', 'esFinal'],
          include: [
            {
              model: GrupoMateria,
              as: 'grupoMateria',
              required: true,
              attributes: ['idGrupoMateria'],
              include: [
                {
                  model: Materia,
                  as: 'materia',
                  required: true,
                  attributes: ['idMateria', 'nombre'],
                  include: [
                    {
                      model: AreaCategoria,
                      as: 'areaCategoria',
                      required: true,
                      attributes: ['idAreaCategoria'],
                      include: [
                        {
                          model: Area,
                          as: 'area',
                          required: true,
                          attributes: ['idArea', 'nombre'],
                        },
                        {
                          model: Categoria,
                          as: 'categoria',
                          required: true,
                          attributes: ['idCategoria', 'nombre'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              model: DocenteProyecto,
              as: 'docentesProyecto',
              required: false, // Permitir proyectos sin jurados
              attributes: ['idDocenteProyecto', 'idDocente'],
              include: [
                {
                  model: Docente,
                  as: 'docente',
                  required: true,
                  attributes: ['idDocente', 'codigoDocente'],
                  include: [
                    {
                      model: Usuario,
                      as: 'usuario',
                      required: true,
                      attributes: ['idUsuario', 'nombre', 'apellido', 'correo'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Procesar proyectos únicos
    const proyectosMap = new Map();

    revisiones.forEach((revision) => {
      const proyecto = revision.proyecto;
      const idProyecto = proyecto.idProyecto;

      if (!proyectosMap.has(idProyecto)) {
        proyectosMap.set(idProyecto, {
          idProyecto: proyecto.idProyecto,
          nombre: proyecto.nombre,
          area: proyecto.grupoMateria.materia.areaCategoria.area.nombre,
          categoria: proyecto.grupoMateria.materia.areaCategoria.categoria.nombre,
          jurados: [],
        });
      }

      // Agregar jurados
      if (proyecto.docentesProyecto && proyecto.docentesProyecto.length > 0) {
        proyecto.docentesProyecto.forEach((dp) => {
          const entry = proyectosMap.get(idProyecto);
          if (entry.jurados.length < 3) {
            // Máximo 3 jurados
            entry.jurados.push({
              idDocente: dp.docente.idDocente,
              codigoDocente: dp.docente.codigoDocente,
              nombre: `${dp.docente.usuario.nombre} ${dp.docente.usuario.apellido}`,
              correo: dp.docente.usuario.correo,
            });
          }
        });
      }
    });

    // Formatear proyectos con jurado1, jurado2, jurado3
    const proyectos = Array.from(proyectosMap.values()).map((p) => ({
      idProyecto: p.idProyecto,
      nombre: p.nombre,
      area: p.area,
      categoria: p.categoria,
      jurado1: p.jurados[0] || null,
      jurado2: p.jurados[1] || null,
      jurado3: p.jurados[2] || null,
    }));

    // Calcular estadísticas
    const totalProyectos = proyectos.length;
    const proyectosSinJurados = proyectos.filter(
      (p) => !p.jurado1 && !p.jurado2 && !p.jurado3
    ).length;
    const proyectosCon1Jurado = proyectos.filter(
      (p) => p.jurado1 && !p.jurado2 && !p.jurado3
    ).length;
    const proyectosCon2Jurados = proyectos.filter(
      (p) => p.jurado1 && p.jurado2 && !p.jurado3
    ).length;
    const proyectosCon3Jurados = proyectos.filter(
      (p) => p.jurado1 && p.jurado2 && p.jurado3
    ).length;
    const proyectosConJurados = totalProyectos - proyectosSinJurados;

    return {
      proyectos,
      estadisticas: {
        totalProyectos,
        proyectosConJurados,
        proyectosSinJurados,
        proyectosCon1Jurado,
        proyectosCon2Jurados,
        proyectosCon3Jurados,
      },
      feriaActual: formatFeriaInfo(feriaActual),
    };
  } catch (error) {
    console.error('Error en getProyectosJuradosFeriaActual:', error);
    throw error;
  }
};

/**
 * Obtener calificaciones finales de todos los proyectos aprobados para exposición
 * Devuelve las 3 calificaciones de jurados y el promedio final
 */
const getCalificacionesFinalesFeriaActual = async () => {
  try {
    // 1. Obtener feria actual
    const feriaActual = await getFeriaActual();
    if (!feriaActual) {
      throw new Error('No hay feria activa');
    }

    // 2. Obtener Tarea 0 (inscripción)
    const tarea0 = await getTarea0(feriaActual.idFeria);

    // 3. Obtener proyectos con esFinal = true de la feria actual
    const proyectos = await Proyecto.findAll({
      include: [
        {
          model: Revision,
          as: 'revisiones',
          where: { idTarea: tarea0.idTarea },
          attributes: [],
          required: true,
        },
        {
          model: GrupoMateria,
          as: 'grupoMateria',
          include: [
            {
              model: Materia,
              as: 'materia',
              include: [
                {
                  model: AreaCategoria,
                  as: 'areaCategoria',
                  include: [
                    {
                      model: Area,
                      as: 'area',
                      attributes: ['nombre'],
                    },
                    {
                      model: Categoria,
                      as: 'categoria',
                      attributes: ['nombre'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: DocenteProyecto,
          as: 'docentesProyecto',
          include: [
            {
              model: Calificacion,
              as: 'calificaciones',
              where: { calificado: true },
              required: false,
            },
          ],
          required: false,
        },
      ],
      where: { esFinal: true },
      order: [['nombre', 'ASC']],
    });

    // 4. Procesar cada proyecto para obtener las calificaciones
    const proyectosConCalificaciones = proyectos.map(proyecto => {
      const area = proyecto.grupoMateria?.materia?.areaCategoria?.area?.nombre || 'Sin área';
      const categoria = proyecto.grupoMateria?.materia?.areaCategoria?.categoria?.nombre || 'Sin categoría';

      // Obtener los 3 jurados y sus calificaciones
      const jurados = proyecto.docentesProyecto || [];
      
      // Inicializar las 3 calificaciones
      const calificaciones = ['Pendiente', 'Pendiente', 'Pendiente'];
      const notasNumericas = [];

      // Procesar cada jurado (máximo 3)
      jurados.slice(0, 3).forEach((jurado, index) => {
        if (jurado.calificaciones && jurado.calificaciones.length > 0) {
          // Sumar todas las calificaciones de este jurado
          const totalPuntaje = jurado.calificaciones.reduce(
            (sum, cal) => sum + cal.puntajeObtenido,
            0
          );
          calificaciones[index] = totalPuntaje;
          notasNumericas.push(totalPuntaje);
        }
      });

      // Calcular nota final (promedio de las 3 calificaciones)
      let notaFinal = 'Pendiente';
      if (notasNumericas.length === 3) {
        // Solo calcular promedio si los 3 jurados han calificado
        const promedio = notasNumericas.reduce((sum, nota) => sum + nota, 0) / 3;
        notaFinal = Math.round(promedio * 100) / 100; // Redondear a 2 decimales
      }

      return {
        idProyecto: proyecto.idProyecto,
        nombre: proyecto.nombre,
        area,
        categoria,
        calificacion1: calificaciones[0],
        calificacion2: calificaciones[1],
        calificacion3: calificaciones[2],
        notaFinal,
      };
    });

    // 5. Calcular estadísticas
    const totalProyectos = proyectosConCalificaciones.length;
    const proyectosCalificados = proyectosConCalificaciones.filter(
      p => typeof p.notaFinal === 'number'
    ).length;
    const proyectosPendientes = totalProyectos - proyectosCalificados;

    return {
      proyectos: proyectosConCalificaciones,
      estadisticas: {
        totalProyectos,
        proyectosCalificados,
        proyectosPendientes,
      },
      feriaActual: formatFeriaInfo(feriaActual),
    };
  } catch (error) {
    console.error('Error en getCalificacionesFinalesFeriaActual:', error);
    throw error;
  }
};

module.exports = {
  // ============================================
  // FERIA ACTUAL
  // ============================================
  
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

  // Reportes Descargables
  getControlNotasFeriaActual,
  getProyectosJuradosFeriaActual,
  getCalificacionesFinalesFeriaActual,

  // ============================================
  // REPORTES GLOBALES
  // ============================================
  
  // KPIs Globales
  getProyectosPorFeriaGlobal,
  getEstudiantesPorFeriaGlobal,
  getJuradosPorFeriaGlobal,
  getTutoresPorFeriaGlobal,

  // Tendencias Globales
  getAreasFrecuentesGlobal,
  getCategoriasFrecuentesGlobal,
  getComparacionFeriasGlobal,

  // Rendimiento Académico Global
  getPromediosPorFeriaGlobal,
  getRankingAreasRendimientoGlobal,

  // Matriz Área vs Categoría
  getMatrizAreaCategoriaGlobal,
};



