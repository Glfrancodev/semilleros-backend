const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/evento.controller');

const { validarToken } = require('../middleware/authMiddleware');

// Ruta para crear un nuevo Evento
router.post('/', validarToken, eventoController.crearEvento);

// Ruta para obtener todos los Eventos
router.get('/', eventoController.obtenerEventos);

// Ruta para obtener un Evento por su ID
router.get('/:id', eventoController.obtenerEventoPorId);

// Ruta para actualizar un Evento
router.put('/:id', validarToken, eventoController.actualizarEvento);

// Ruta para eliminar un Evento
router.delete('/:id', validarToken, eventoController.eliminarEvento);

module.exports = router;
