const express = require('express');
const router = express.Router();
const rolPermisoController = require('../controllers/rolpermiso.controller');

router.post('/', rolPermisoController.crearRolPermiso);
router.get('/', rolPermisoController.obtenerRolPermisos);
router.get('/:id', rolPermisoController.obtenerRolPermisoPorId);
router.delete('/:id', rolPermisoController.eliminarRolPermiso);

module.exports = router;
