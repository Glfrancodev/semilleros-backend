const express = require('express');
const subCalificacionController = require('../controllers/subCalificacion.controller');

const router = express.Router();

// POST /api/sub-calificaciones - Crear subcalificación
router.post('/', subCalificacionController.crearSubCalificacion);

// GET /api/sub-calificaciones - Obtener todas las subcalificaciones
router.get('/', subCalificacionController.obtenerSubCalificaciones);

// GET /api/sub-calificaciones/tipo/:idTipoCalificacion - Obtener por tipo
router.get('/tipo/:idTipoCalificacion', subCalificacionController.obtenerSubCalificacionesPorTipo);

// GET /api/sub-calificaciones/:idSubCalificacion - Obtener por ID
router.get('/:idSubCalificacion', subCalificacionController.obtenerSubCalificacionPorId);

// PUT /api/sub-calificaciones/:idSubCalificacion - Actualizar subcalificación
router.put('/:idSubCalificacion', subCalificacionController.actualizarSubCalificacion);

// DELETE /api/sub-calificaciones/:idSubCalificacion - Eliminar subcalificación
router.delete('/:idSubCalificacion', subCalificacionController.eliminarSubCalificacion);

module.exports = router;
