const express = require('express');
const router = express.Router();
const dataSeederController = require('../controllers/dataSeeder.controller');

// Rutas para poblar
router.post('/permisos', dataSeederController.seedPermisos);
router.post('/roles', dataSeederController.seedRoles);
router.post('/usuarios', dataSeederController.seedUsuarios);
router.post('/semestres', dataSeederController.seedSemestres);
router.post('/materias', dataSeederController.seedMaterias);
router.post('/grupos', dataSeederController.seedGrupos);
router.post('/grupo-materias', dataSeederController.seedGrupoMaterias);
router.post('/tipos-calificacion', dataSeederController.seedTiposCalificacion);
router.post('/sub-calificaciones', dataSeederController.seedSubCalificaciones);
router.post('/categorias', dataSeederController.seedCategorias);
router.post('/convocatorias', dataSeederController.seedConvocatorias);
router.post('/eventos', dataSeederController.seedEventos);

module.exports = router;
