const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/evento.controller');

// Ruta para crear un nuevo Evento
router.post('/', eventoController.crearEvento);

// Ruta para obtener todos los Eventos
router.get('/', eventoController.obtenerEventos);

// Ruta para obtener un Evento por su ID
router.get('/:id', eventoController.obtenerEventoPorId);

// Ruta para actualizar un Evento
router.put('/:id', eventoController.actualizarEvento);

// Ruta para eliminar un Evento
router.delete('/:id', eventoController.eliminarEvento);

module.exports = router;
