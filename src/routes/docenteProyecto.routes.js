const express = require('express');
const docenteProyectoController = require('../controllers/docenteProyecto.controller');

const router = express.Router();

// POST /api/docente-proyectos - Asignar docente a proyecto
router.post('/', docenteProyectoController.asignarDocenteAProyecto);

// GET /api/docente-proyectos - Obtener todas las asignaciones
router.get('/', docenteProyectoController.obtenerAsignaciones);

// GET /api/docente-proyectos/proyecto/:idProyecto - Obtener docentes de un proyecto
router.get('/proyecto/:idProyecto', docenteProyectoController.obtenerDocentesPorProyecto);

// GET /api/docente-proyectos/docente/:idDocente - Obtener proyectos de un docente
router.get('/docente/:idDocente', docenteProyectoController.obtenerProyectosPorDocente);

// GET /api/docente-proyectos/:idDocenteProyecto - Obtener asignación por ID
router.get('/:idDocenteProyecto', docenteProyectoController.obtenerAsignacionPorId);

// PUT /api/docente-proyectos/:idDocenteProyecto - Actualizar asignación
router.put('/:idDocenteProyecto', docenteProyectoController.actualizarAsignacion);

// DELETE /api/docente-proyectos/:idDocenteProyecto - Eliminar asignación
router.delete('/:idDocenteProyecto', docenteProyectoController.eliminarAsignacion);

module.exports = router;
