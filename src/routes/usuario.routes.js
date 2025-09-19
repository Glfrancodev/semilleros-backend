const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

// Ruta para crear un nuevo usuario
router.post('/', usuarioController.crearUsuario);

// Ruta para obtener todos los usuarios
router.get('/', usuarioController.obtenerUsuarios);

// Ruta para obtener un usuario por su ID
router.get('/:id', usuarioController.obtenerUsuarioPorId);

// Ruta para actualizar un usuario
router.put('/:id', usuarioController.actualizarUsuario);

// Ruta para cambiar el estado (soft delete) de un usuario
router.patch('/:id/estado', usuarioController.toggleEstadoUsuario);

// Ruta de Login
router.post('/login', usuarioController.login);  // Agregado

module.exports = router;
