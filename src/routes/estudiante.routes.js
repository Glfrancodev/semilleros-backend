const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudiante.controller');

// Ruta para crear un nuevo Estudiante
router.post('/', estudianteController.crearEstudiante);

// Ruta para obtener todos los Estudiantes
router.get('/', estudianteController.obtenerEstudiantes);

// Ruta para obtener un Estudiante por su ID
router.get('/:id', estudianteController.obtenerEstudiantePorId);

// Ruta para actualizar un Estudiante
router.put('/:id', estudianteController.actualizarEstudiante);

// Ruta para eliminar un Estudiante (Hard delete)
router.delete('/:id', estudianteController.eliminarEstudiante);

module.exports = router;
