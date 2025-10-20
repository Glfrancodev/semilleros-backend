const express = require('express');
const tipoCalificacionController = require('../controllers/tipoCalificacion.controller');

const router = express.Router();

// POST /api/tipos-calificacion - Crear tipo de calificación
router.post('/', tipoCalificacionController.crearTipoCalificacion);

// GET /api/tipos-calificacion - Obtener todos los tipos de calificación
router.get('/', tipoCalificacionController.obtenerTiposCalificacion);

// GET /api/tipos-calificacion/:idTipoCalificacion - Obtener tipo por ID
router.get('/:idTipoCalificacion', tipoCalificacionController.obtenerTipoCalificacionPorId);

// PUT /api/tipos-calificacion/:idTipoCalificacion - Actualizar tipo
router.put('/:idTipoCalificacion', tipoCalificacionController.actualizarTipoCalificacion);

// DELETE /api/tipos-calificacion/:idTipoCalificacion - Eliminar tipo
router.delete('/:idTipoCalificacion', tipoCalificacionController.eliminarTipoCalificacion);

module.exports = router;
