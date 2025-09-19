const express = require('express');
const router = express.Router();
const estudianteEventoController = require('../controllers/estudianteEvento.controller');

// Ruta para crear un nuevo EstudianteEvento
router.post('/', estudianteEventoController.crearEstudianteEvento);

// Ruta para obtener todos los EstudianteEventos
router.get('/', estudianteEventoController.obtenerEstudianteEventos);

// Ruta para obtener un EstudianteEvento por su ID
router.get('/:id', estudianteEventoController.obtenerEstudianteEventoPorId);

// Ruta para eliminar un EstudianteEvento
router.delete('/:id', estudianteEventoController.eliminarEstudianteEvento);

module.exports = router;
