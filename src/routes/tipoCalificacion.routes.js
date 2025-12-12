const express = require('express');
const tipoCalificacionController = require('../controllers/tipoCalificacion.controller');
const { validarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/tipos-calificacion - Crear tipo de calificación
// POST /api/tipos-calificacion - Crear tipo de calificación
router.post('/', validarToken, tipoCalificacionController.crearTipoCalificacion);

// GET /api/tipos-calificacion - Obtener todos los tipos de calificación
router.get('/', validarToken, tipoCalificacionController.obtenerTiposCalificacion);

// GET /api/tipos-calificacion/:idTipoCalificacion - Obtener tipo por ID
router.get('/:idTipoCalificacion', validarToken, tipoCalificacionController.obtenerTipoCalificacionPorId);

// PUT /api/tipos-calificacion/:idTipoCalificacion - Actualizar tipo
router.put('/:idTipoCalificacion', validarToken, tipoCalificacionController.actualizarTipoCalificacion);

// DELETE /api/tipos-calificacion/:idTipoCalificacion - Eliminar tipo
router.delete('/:idTipoCalificacion', validarToken, tipoCalificacionController.eliminarTipoCalificacion);

module.exports = router;
