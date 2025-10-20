const express = require('express');
const calificacionController = require('../controllers/calificacion.controller');

const router = express.Router();

// POST /api/calificaciones - Crear calificación
router.post('/', calificacionController.crearCalificacion);

// GET /api/calificaciones - Obtener todas las calificaciones
router.get('/', calificacionController.obtenerCalificaciones);

// GET /api/calificaciones/docente-proyecto/:idDocenteProyecto - Obtener por docente-proyecto
router.get('/docente-proyecto/:idDocenteProyecto', calificacionController.obtenerCalificacionesPorDocenteProyecto);

// GET /api/calificaciones/sub-calificacion/:idSubCalificacion - Obtener por subcalificación
router.get('/sub-calificacion/:idSubCalificacion', calificacionController.obtenerCalificacionesPorSubCalificacion);

// GET /api/calificaciones/:idCalificacion - Obtener por ID
router.get('/:idCalificacion', calificacionController.obtenerCalificacionPorId);

// PUT /api/calificaciones/:idCalificacion - Actualizar calificación
router.put('/:idCalificacion', calificacionController.actualizarCalificacion);

// DELETE /api/calificaciones/:idCalificacion - Eliminar calificación
router.delete('/:idCalificacion', calificacionController.eliminarCalificacion);

module.exports = router;
