const express = require("express");
const estudianteProyectoController = require("../controllers/estudianteProyecto.controller");

const router = express.Router();

// POST /api/estudiante-proyectos - Asignar estudiante a proyecto
router.post("/", estudianteProyectoController.asignarEstudianteAProyecto);

// GET /api/estudiante-proyectos - Obtener todas las asignaciones
router.get("/", estudianteProyectoController.obtenerAsignaciones);

// GET /api/estudiante-proyectos/proyecto/:idProyecto - Obtener estudiantes de un proyecto
router.get(
  "/proyecto/:idProyecto",
  estudianteProyectoController.obtenerEstudiantesPorProyecto
);

// GET /api/estudiante-proyectos/estudiante/:idEstudiante - Obtener proyectos de un estudiante
router.get(
  "/estudiante/:idEstudiante",
  estudianteProyectoController.obtenerProyectosPorEstudiante
);

// PUT /api/estudiante-proyectos/:idEstudianteProyecto - Actualizar asignació
router.put(
  "/:idEstudianteProyecto",
  estudianteProyectoController.actualizarAsignacion
);

// DELETE /api/estudiante-proyectos/:idEstudianteProyecto - Eliminar asignación
router.delete(
  "/:idEstudianteProyecto",
  estudianteProyectoController.eliminarAsignacion
);

module.exports = router;
