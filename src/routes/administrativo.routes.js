const express = require('express');
const router = express.Router();
const administrativoController = require('../controllers/administrativo.controller');

// Ruta para crear un nuevo Administrativo
router.post('/', administrativoController.crearAdministrativo);

// Ruta para obtener todos los Administrativos
router.get('/', administrativoController.obtenerAdministrativos);

// Ruta para obtener un Administrativo por su ID
router.get('/:id', administrativoController.obtenerAdministrativoPorId);

// Ruta para actualizar un Administrativo
router.put('/:id', administrativoController.actualizarAdministrativo);

// Ruta para eliminar un Administrativo (Hard delete)
router.delete('/:id', administrativoController.eliminarAdministrativo);

module.exports = router;
