const express = require("express");
const proyectoController = require("../controllers/proyecto.controller");

const router = express.Router();

// POST /api/proyectos - Crear proyecto
router.post("/", proyectoController.crearProyecto);

// GET /api/proyectos - Obtener todos los proyectos
router.get("/", proyectoController.obtenerProyectos);

// GET /api/proyectos/convocatoria/:idConvocatoria - Obtener proyectos por convocatoria
router.get(
  "/convocatoria/:idConvocatoria",
  proyectoController.obtenerProyectosPorConvocatoria
);

// GET /api/proyectos/:idProyecto - Obtener proyecto por ID
router.get("/:idProyecto", proyectoController.obtenerProyectoPorId);

// PUT /api/proyectos/:idProyecto - Actualizar proyecto
router.put("/:idProyecto", proyectoController.actualizarProyecto);

// DELETE /api/proyectos/:idProyecto - Eliminar proyecto
router.delete("/:idProyecto", proyectoController.eliminarProyecto);

module.exports = router;
