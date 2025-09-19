const express = require('express');
const router = express.Router();

const rolRoutes = require('./rol.routes');
const permisoRoutes = require('./permiso.routes');
const rolPermisoRoutes = require('./rolpermiso.routes');  // Rutas de RolPermiso
const usuarioRoutes = require('./usuario.routes');  // Rutas de Usuario
const dataSeederRoutes = require('./dataSeeder.routes');  // Importamos la ruta para poblar
const estudianteRoutes = require('./estudiante.routes'); // Rutas de Estudiante
const eventoRoutes = require('./evento.routes'); // Rutas de Evento
const estudianteEventoRoutes = require('./estudianteEvento.routes'); // Rutas de EstudianteEvento

router.use('/estudiante-eventos', estudianteEventoRoutes); // 👉 /api/estudiante-eventos

// Ruta para manejar Eventos
router.use('/eventos', eventoRoutes); // 👉 /api/eventos

// Ruta para manejar Estudiantes
router.use('/estudiantes', estudianteRoutes); // 👉 /api/estudiantes

// Definir las rutas principales de la API
router.use('/roles', rolRoutes);            // 👉 /api/roles
router.use('/permisos', permisoRoutes);     // 👉 /api/permisos
router.use('/rol-permisos', rolPermisoRoutes);  // 👉 /api/rol-permisos
router.use('/usuarios', usuarioRoutes);    // 👉 /api/usuarios
router.use('/seed', dataSeederRoutes);  // Asociamos la nueva ruta

module.exports = router;
