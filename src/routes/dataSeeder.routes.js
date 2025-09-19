const express = require('express');
const router = express.Router();
const dataSeederController = require('../controllers/dataSeeder.controller');

// Ruta para poblar permisos (solo por ahora)
router.post('/permisos', dataSeederController.seedPermisos);

module.exports = router;
