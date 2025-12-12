const express = require('express');
const subCalificacionController = require('../controllers/subCalificacion.controller');
const { validarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/sub-calificaciones - Crear subcalificación
router.post('/', validarToken, subCalificacionController.crearSubCalificacion);

// GET /api/sub-calificaciones - Obtener todas las subcalificaciones
router.get('/', validarToken, subCalificacionController.obtenerSubCalificaciones);

// GET /api/sub-calificaciones/tipo/:idTipoCalificacion - Obtener por tipo
router.get('/tipo/:idTipoCalificacion', validarToken, subCalificacionController.obtenerSubCalificacionesPorTipo);

// GET /api/sub-calificaciones/:idSubCalificacion - Obtener por ID
router.get('/:idSubCalificacion', validarToken, subCalificacionController.obtenerSubCalificacionPorId);

// PUT /api/sub-calificaciones/:idSubCalificacion - Actualizar subcalificación
router.put('/:idSubCalificacion', validarToken, subCalificacionController.actualizarSubCalificacion);

// DELETE /api/sub-calificaciones/:idSubCalificacion - Eliminar subcalificación
router.delete('/:idSubCalificacion', validarToken, subCalificacionController.eliminarSubCalificacion);

module.exports = router;
