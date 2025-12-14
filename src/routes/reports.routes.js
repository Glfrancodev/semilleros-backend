const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports.controller");

// ============================================
// RUTAS DE KPIs
// ============================================

// KPI 1: Total de proyectos inscritos
router.get("/kpi/proyectos-inscritos", reportsController.getProyectosInscritos);

// KPI 2: Total de estudiantes participantes
router.get(
  "/kpi/estudiantes-participantes",
  reportsController.getEstudiantesParticipantes
);

// KPI 3: Total de tutores
router.get("/kpi/tutores", reportsController.getTutores);

// KPI 4: Total de jurados
router.get("/kpi/jurados", reportsController.getJurados);

// KPI 5: Total de eventos realizados
router.get("/kpi/eventos-realizados", reportsController.getEventosRealizados);

// KPI 6: % de proyectos aprobados por tutor
router.get(
  "/kpi/porcentaje-aprobados-tutor",
  reportsController.getPorcentajeAprobadosTutor
);

// KPI 7: % de proyectos aprobados por administrador
router.get(
  "/kpi/porcentaje-aprobados-admin",
  reportsController.getPorcentajeAprobadosAdmin
);

// KPI 8: % de proyectos aprobados para exposición
router.get(
  "/kpi/porcentaje-aprobados-exposicion",
  reportsController.getPorcentajeAprobadosExposicion
);

// ============================================
// RUTAS DE GRÁFICOS
// ============================================

// Gráfico 1: Proyectos por estado
router.get(
  "/graficos/proyectos-por-estado",
  reportsController.getProyectosPorEstado
);

// Gráfico 2: Participación por área y categoría
router.get(
  "/graficos/participacion-area-categoria",
  reportsController.getParticipacionAreaCategoria
);

// Gráfico 3: Carga y desempeño de jurados
router.get(
  "/graficos/carga-desempeno-jurados",
  reportsController.getCargaDesempenoJurados
);

// Gráfico 4: Calificaciones de la feria
router.get(
  "/graficos/calificaciones-feria",
  reportsController.getCalificacionesFeria
);

// Gráfico 5: Participación en eventos
router.get(
  "/graficos/participacion-eventos",
  reportsController.getParticipacionEventos
);

// ============================================
// RUTA AUXILIAR
// ============================================

// Obtener información de la feria actual
router.get("/info", reportsController.getFeriaActualInfo);

module.exports = router;
