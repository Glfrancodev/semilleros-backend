const express = require("express");
const proyectoController = require("../controllers/proyecto.controller");
const { validarToken } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/proyectos - Crear proyecto
router.post("/", proyectoController.crearProyecto);

// GET /api/proyectos/mis-proyectos - Obtener proyectos del usuario autenticado (DEBE IR ANTES de /:idProyecto)
router.get(
  "/mis-proyectos",
  validarToken,
  proyectoController.obtenerMisProyectos
);

// GET /api/proyectos/mis-proyectos-lider - Obtener proyectos donde el estudiante es líder
router.get(
  "/mis-proyectos-lider",
  validarToken,
  proyectoController.obtenerMisProyectosComoLider
);

// GET /api/proyectos/mis-proyectos-invitados - Obtener proyectos con invitación pendiente
router.get(
  "/mis-proyectos-invitados",
  validarToken,
  proyectoController.obtenerMisProyectosInvitados
);

// GET /api/proyectos/aprobados-feria - Obtener proyectos aprobados para feria (DEBE IR ANTES de /:idProyecto)
router.get(
  "/aprobados-feria",
  proyectoController.obtenerProyectosAprobadosFeria
);

// GET /api/proyectos/materia/:idMateria - Obtener proyectos por materia (DEBE IR ANTES de /:idProyecto)
router.get(
  "/materia/:idMateria",
  validarToken,
  proyectoController.obtenerProyectosPorMateria
);

// GET /api/proyectos - Obtener todos los proyectos
router.get("/", proyectoController.obtenerProyectos);

// GET /api/proyectos/convocatoria/:idConvocatoria - Obtener proyectos por convocatoria
router.get(
  "/convocatoria/:idConvocatoria",
  proyectoController.obtenerProyectosPorConvocatoria
);

// GET /api/proyectos/:idProyecto - Obtener proyecto por ID
router.get("/:idProyecto", proyectoController.obtenerProyectoPorId);

// GET /api/proyectos/:idProyecto/integrantes - Obtener integrantes del proyecto
router.get(
  "/:idProyecto/integrantes",
  proyectoController.obtenerIntegrantesProyecto
);

// GET /api/proyectos/:idProyecto/tareas-organizadas - Obtener tareas organizadas por estado
router.get(
  "/:idProyecto/tareas-organizadas",
  proyectoController.obtenerTareasOrganizadas
);

// GET /api/proyectos/:idProyecto/contenido-editor - Obtener contenido del editor con imágenes
router.get(
  "/:idProyecto/contenido-editor",
  proyectoController.obtenerContenidoEditor
);

// GET /api/proyectos/:idProyecto/invitaciones - Obtener todas las invitaciones enviadas de un proyecto
router.get(
  "/:idProyecto/invitaciones",
  proyectoController.obtenerInvitacionesProyecto
);

// GET /api/proyectos/:idProyecto/nota-promedio - Obtener nota promedio del proyecto
router.get(
  "/:idProyecto/nota-promedio",
  proyectoController.obtenerNotaPromedioProyecto
);

// PUT /api/proyectos/:idProyecto/aprobar-tutor - Actualizar aprobación del tutor
router.put(
  "/:idProyecto/aprobar-tutor",
  validarToken,
  proyectoController.actualizarProyectoAprobadoTutor
);

// PUT /api/proyectos/:idProyecto - Actualizar proyecto
router.put("/:idProyecto", proyectoController.actualizarProyecto);

// DELETE /api/proyectos/:idProyecto - Eliminar proyecto
router.delete("/:idProyecto", proyectoController.eliminarProyecto);

module.exports = router;
