const express = require('express');
const convocatoriaController = require('../controllers/convocatoria.controller');

const router = express.Router();

// POST /api/convocatorias - Crear convocatoria
router.post('/', convocatoriaController.crearConvocatoria);

// GET /api/convocatorias - Obtener todas las convocatorias
router.get('/', convocatoriaController.obtenerConvocatorias);

// GET /api/convocatorias/:idConvocatoria - Obtener convocatoria por ID
router.get('/:idConvocatoria', convocatoriaController.obtenerConvocatoriaPorId);

// PUT /api/convocatorias/:idConvocatoria - Actualizar convocatoria
router.put('/:idConvocatoria', convocatoriaController.actualizarConvocatoria);

// DELETE /api/convocatorias/:idConvocatoria - Eliminar convocatoria
router.delete('/:idConvocatoria', convocatoriaController.eliminarConvocatoria);

module.exports = router;
