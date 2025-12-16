const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports.controller");

// ============================================
// RUTAS DE KPIs - FERIA ACTUAL
// ============================================

// KPI 1: Total de proyectos inscritos
router.get("/feria-actual/kpi/proyectos-inscritos", reportsController.getProyectosInscritos);

// KPI 2: Total de estudiantes participantes
router.get(
  "/feria-actual/kpi/estudiantes-participantes",
  reportsController.getEstudiantesParticipantes
);

// KPI 3: Total de tutores
router.get("/feria-actual/kpi/tutores", reportsController.getTutores);

// KPI 4: Total de jurados
router.get("/feria-actual/kpi/jurados", reportsController.getJurados);

// KPI 5: Total de eventos realizados
router.get("/feria-actual/kpi/eventos-realizados", reportsController.getEventosRealizados);

// KPI 6: % de proyectos aprobados por tutor
router.get(
  "/feria-actual/kpi/porcentaje-aprobados-tutor",
  reportsController.getPorcentajeAprobadosTutor
);

// KPI 7: % de proyectos aprobados por administrador
router.get(
  "/feria-actual/kpi/porcentaje-aprobados-admin",
  reportsController.getPorcentajeAprobadosAdmin
);

// KPI 8: % de proyectos aprobados para exposición
router.get(
  "/feria-actual/kpi/porcentaje-aprobados-exposicion",
  reportsController.getPorcentajeAprobadosExposicion
);

// ============================================
// RUTAS DE GRÁFICOS - FERIA ACTUAL
// ============================================

// Gráfico 1: Proyectos por estado
router.get(
  "/feria-actual/graficos/proyectos-por-estado",
  reportsController.getProyectosPorEstado
);

// Gráfico 2: Participación por área y categoría
router.get(
  "/feria-actual/graficos/participacion-area-categoria",
  reportsController.getParticipacionAreaCategoria
);

// Gráfico 3: Carga y desempeño de jurados
router.get(
  "/feria-actual/graficos/carga-desempeno-jurados",
  reportsController.getCargaDesempenoJurados
);

// Gráfico 4: Calificaciones de la feria
router.get(
  "/feria-actual/graficos/calificaciones-feria",
  reportsController.getCalificacionesFeria
);

// Gráfico 5: Participación en eventos
router.get(
  "/feria-actual/graficos/participacion-eventos",
  reportsController.getParticipacionEventos
);

// ============================================
// RUTA AUXILIAR - FERIA ACTUAL
// ============================================

// Obtener información de la feria actual
router.get("/feria-actual/info", reportsController.getFeriaActualInfo);

// ============================================
// REPORTES DESCARGABLES - FERIA ACTUAL
// ============================================

// Control de Notas: Matriz de proyectos x tareas con calificaciones
router.get("/feria-actual/control-notas", reportsController.getControlNotasFeriaActual);

// Proyectos con Jurados: Lista de proyectos aprobados con sus jurados asignados
router.get("/feria-actual/proyectos-jurados", reportsController.getProyectosJuradosFeriaActual);


// ============================================
// REPORTES GLOBALES - KPIs
// ============================================

// Global KPI 1: Proyectos por feria (serie temporal)
router.get(
  "/global/kpi/proyectos-por-feria",
  reportsController.getProyectosPorFeriaGlobal
);

// Global KPI 2: Estudiantes por feria (serie temporal)
router.get(
  "/global/kpi/estudiantes-por-feria",
  reportsController.getEstudiantesPorFeriaGlobal
);

// Global KPI 3: Jurados por feria (serie temporal)
router.get(
  "/global/kpi/jurados-por-feria",
  reportsController.getJuradosPorFeriaGlobal
);

// Global KPI 4: Tutores por feria (serie temporal)
router.get(
  "/global/kpi/tutores-por-feria",
  reportsController.getTutoresPorFeriaGlobal
);

// ============================================
// REPORTES GLOBALES - TENDENCIAS
// ============================================

// Tendencia 1: Áreas más frecuentes
router.get(
  "/global/tendencias/areas-frecuentes",
  reportsController.getAreasFrecuentesGlobal
);

// Tendencia 2: Categorías más frecuentes
router.get(
  "/global/tendencias/categorias-frecuentes",
  reportsController.getCategoriasFrecuentesGlobal
);

// Tendencia 3: Comparación entre ferias
router.get(
  "/global/tendencias/comparacion-ferias",
  reportsController.getComparacionFeriasGlobal
);

// ============================================
// REPORTES GLOBALES - RENDIMIENTO ACADÉMICO
// ============================================

// Rendimiento 1: Promedio general por feria
router.get(
  "/global/rendimiento/promedio-por-feria",
  reportsController.getPromediosPorFeriaGlobal
);

// Rendimiento 2: Ranking de áreas por rendimiento
router.get(
  "/global/rendimiento/ranking-areas",
  reportsController.getRankingAreasRendimientoGlobal
);

// ============================================
// REPORTES GLOBALES - MATRIZ ÁREA VS CATEGORÍA
// ============================================

// Matriz: Área vs Categoría (Heatmap)
router.get(
  "/global/matriz/area-categoria",
  reportsController.getMatrizAreaCategoriaGlobal
);

module.exports = router;
