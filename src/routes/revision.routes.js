const express = require('express');
const revisionController = require('../controllers/revision.controller');

const router = express.Router();

// POST /api/revisiones - Crear revisión
router.post('/', revisionController.crearRevision);

// GET /api/revisiones - Obtener todas las revisiones
router.get('/', revisionController.obtenerRevisiones);

// GET /api/revisiones/proyecto/:idProyecto - Obtener revisiones por proyecto
router.get('/proyecto/:idProyecto', revisionController.obtenerRevisionesPorProyecto);

// GET /api/revisiones/:idRevision - Obtener revisión por ID
router.get('/:idRevision', revisionController.obtenerRevisionPorId);

// PUT /api/revisiones/:idRevision - Actualizar revisión
router.put('/:idRevision', revisionController.actualizarRevision);

// DELETE /api/revisiones/:idRevision - Eliminar revisión
router.delete('/:idRevision', revisionController.eliminarRevision);

module.exports = router;
