const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rol.controller');
const { verificarPermiso } = require('../middleware/verificarPermiso');  // Importamos el middleware

// Ruta para crear un nuevo rol (solo si el usuario tiene el permiso 'Crear rol')
router.post('/', verificarPermiso('Crear rol'), rolController.crearRol);  // Aplicamos el middleware de permisos

// Rutas para obtener, actualizar y eliminar roles
router.get('/', rolController.obtenerRoles);
router.get('/:id', rolController.obtenerRolPorId);
router.put('/:id', rolController.actualizarRol);
router.delete('/:id', rolController.eliminarRol);

module.exports = router;
