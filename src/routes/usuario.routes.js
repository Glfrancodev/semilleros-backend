const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { validarToken } = require('../middleware/authMiddleware');

// Ruta para crear un nuevo usuario
router.post('/', usuarioController.crearUsuario);

// Ruta para obtener todos los usuarios
router.get('/', usuarioController.obtenerUsuarios);

// Ruta de Login
router.post('/login', usuarioController.login);  // Agregado

// Ruta para obtener el perfil del usuario logeado
router.get('/perfil', validarToken, usuarioController.obtenerPerfil);

// Ruta para obtener un usuario por su ID
router.get('/:id', usuarioController.obtenerUsuarioPorId);

// Ruta para actualizar un usuario
router.put('/:id', usuarioController.actualizarUsuario);

// Ruta para cambiar el estado (soft delete) de un usuario
router.patch('/:id/estado', usuarioController.toggleEstadoUsuario);

module.exports = router;
