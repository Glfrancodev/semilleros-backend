const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docente.controller');

// Ruta para crear un nuevo Docente
router.post('/', docenteController.crearDocente);

// Ruta para obtener todos los Docentes
router.get('/', docenteController.obtenerDocentes);

// Ruta para obtener un Docente por su ID
router.get('/:id', docenteController.obtenerDocentePorId);

// Ruta para actualizar un Docente
router.put('/:id', docenteController.actualizarDocente);

// Ruta para eliminar un Docente (Hard delete)
router.delete('/:id', docenteController.eliminarDocente);

module.exports = router;
