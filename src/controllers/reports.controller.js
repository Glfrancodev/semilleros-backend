const reportsService = require("../services/reports.service");

// ============================================
// CONTROLADORES DE KPIs
// ============================================

/**
 * KPI 1: Total de proyectos inscritos
 */
const getProyectosInscritos = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getProyectosInscritos(filtros);

    return res.success("Total de proyectos inscritos obtenido exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener proyectos inscritos:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener proyectos inscritos", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * KPI 2: Total de estudiantes participantes
 */
const getEstudiantesParticipantes = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getEstudiantesParticipantes(filtros);

    return res.success(
      "Total de estudiantes participantes obtenido exitosamente",
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error("Error al obtener estudiantes participantes:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener estudiantes participantes", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * KPI 3: Total de tutores
 */
const getTutores = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getTutores(filtros);

    return res.success("Total de tutores obtenido exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener tutores:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener tutores", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * KPI 4: Total de jurados
 */
const getJurados = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getJurados(filtros);

    return res.success("Total de jurados obtenido exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener jurados:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener jurados", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * KPI 5: Total de eventos realizados
 */
const getEventosRealizados = async (req, res) => {
  try {
    const filtros = {
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin,
    };

    const data = await reportsService.getEventosRealizados(filtros);

    return res.success("Total de eventos realizados obtenido exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener eventos realizados:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener eventos realizados", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * KPI 6: % de proyectos aprobados por tutor
 */
const getPorcentajeAprobadosTutor = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getPorcentajeAprobadosTutor(filtros);

    return res.success(
      "Porcentaje de proyectos aprobados por tutor obtenido exitosamente",
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error("Error al obtener porcentaje aprobados por tutor:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error(
      "Error al obtener porcentaje de proyectos aprobados por tutor",
      500,
      {
        code: "INTERNAL_ERROR",
        details: err.message,
      }
    );
  }
};

/**
 * KPI 7: % de proyectos aprobados por administrador
 */
const getPorcentajeAprobadosAdmin = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getPorcentajeAprobadosAdmin(filtros);

    return res.success(
      "Porcentaje de proyectos aprobados por administrador obtenido exitosamente",
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error("Error al obtener porcentaje aprobados por admin:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error(
      "Error al obtener porcentaje de proyectos aprobados por administrador",
      500,
      {
        code: "INTERNAL_ERROR",
        details: err.message,
      }
    );
  }
};

/**
 * KPI 8: % de proyectos aprobados para exposición
 */
const getPorcentajeAprobadosExposicion = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getPorcentajeAprobadosExposicion(filtros);

    return res.success(
      "Porcentaje de proyectos aprobados para exposición obtenido exitosamente",
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error(
      "Error al obtener porcentaje aprobados para exposición:",
      err
    );

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error(
      "Error al obtener porcentaje de proyectos aprobados para exposición",
      500,
      {
        code: "INTERNAL_ERROR",
        details: err.message,
      }
    );
  }
};

// ============================================
// CONTROLADORES DE GRÁFICOS
// ============================================

/**
 * Gráfico 1: Proyectos por estado
 */
const getProyectosPorEstado = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getProyectosPorEstado(filtros);

    return res.success("Proyectos por estado obtenidos exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener proyectos por estado:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener proyectos por estado", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * Gráfico 2: Participación por área y categoría
 */
const getParticipacionAreaCategoria = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getParticipacionAreaCategoria(filtros);

    return res.success(
      "Participación por área y categoría obtenida exitosamente",
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error("Error al obtener participación por área y categoría:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error(
      "Error al obtener participación por área y categoría",
      500,
      {
        code: "INTERNAL_ERROR",
        details: err.message,
      }
    );
  }
};

/**
 * Gráfico 3: Carga y desempeño de jurados
 */
const getCargaDesempenoJurados = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getCargaDesempenoJurados(filtros);

    return res.success(
      "Carga y desempeño de jurados obtenido exitosamente",
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error("Error al obtener carga y desempeño de jurados:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener carga y desempeño de jurados", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * Gráfico 4: Calificaciones de la feria
 */
const getCalificacionesFeria = async (req, res) => {
  try {
    const filtros = {
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
      grupoMateriaId: req.query.grupoMateriaId,
      materiaId: req.query.materiaId,
      semestreId: req.query.semestreId,
    };

    const data = await reportsService.getCalificacionesFeria(filtros);

    return res.success("Calificaciones de la feria obtenidas exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener calificaciones de la feria:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener calificaciones de la feria", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

/**
 * Gráfico 5: Participación en eventos
 */
const getParticipacionEventos = async (req, res) => {
  try {
    const filtros = {
      fechaInicio: req.query.fechaInicio,
      fechaFin: req.query.fechaFin,
      areaId: req.query.areaId,
      categoriaId: req.query.categoriaId,
    };

    const data = await reportsService.getParticipacionEventos(filtros);

    return res.success("Participación en eventos obtenida exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener participación en eventos:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener participación en eventos", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

// ============================================
// CONTROLADOR AUXILIAR
// ============================================

/**
 * Obtener información de la feria actual
 */
const getFeriaActualInfo = async (req, res) => {
  try {
    const data = await reportsService.getFeriaActualInfo();

    return res.success("Información de feria actual obtenida exitosamente", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al obtener información de feria actual:", err);

    if (err.message === "No hay una feria activa en este momento") {
      return res.error(err.message, 404, {
        code: "NO_ACTIVE_FERIA",
        details: err.message,
      });
    }

    return res.error("Error al obtener información de feria actual", 500, {
      code: "INTERNAL_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
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
