const express = require('express');
const router = express.Router();
const dataSeederController = require('../controllers/dataSeeder.controller');

// Rutas para poblar
router.post('/permisos', dataSeederController.seedPermisos);
router.post('/roles', dataSeederController.seedRoles);

module.exports = router;
