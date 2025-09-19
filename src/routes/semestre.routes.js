const express = require('express');
const router = express.Router();
const semestreController = require('../controllers/semestre.controller');

// Ruta para crear un nuevo Semestre
router.post('/', semestreController.crearSemestre);

// Ruta para obtener todos los Semestres
router.get('/', semestreController.obtenerSemestres);

// Ruta para obtener un Semestre por su ID
router.get('/:id', semestreController.obtenerSemestrePorId);

// Ruta para actualizar un Semestre
router.put('/:id', semestreController.actualizarSemestre);

// Ruta para eliminar un Semestre (Hard delete)
router.delete('/:id', semestreController.eliminarSemestre);

module.exports = router;
