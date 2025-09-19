const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupo.controller');

// Ruta para crear un nuevo Grupo
router.post('/', grupoController.crearGrupo);

// Ruta para obtener todos los Grupos
router.get('/', grupoController.obtenerGrupos);

// Ruta para obtener un Grupo por su ID
router.get('/:id', grupoController.obtenerGrupoPorId);

// Ruta para actualizar un Grupo
router.put('/:id', grupoController.actualizarGrupo);

// Ruta para eliminar un Grupo (Hard delete)
router.delete('/:id', grupoController.eliminarGrupo);

module.exports = router;
