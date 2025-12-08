const express = require("express");
const router = express.Router();
const estudianteController = require("../controllers/estudiante.controller");
const { validarToken } = require("../middleware/authMiddleware");

// Ruta para obtener el leaderboard de estudiantes
router.get("/leaderboard", estudianteController.obtenerLeaderboard);

// Ruta pública para obtener perfil de un estudiante
router.get(
  "/:idEstudiante/perfil-publico",
  estudianteController.obtenerPerfilPublico
);

// Ruta pública para obtener proyectos de un estudiante
router.get(
  "/:idEstudiante/proyectos",
  estudianteController.obtenerProyectosEstudiante
);

// Ruta para crear un nuevo Estudiante
router.post("/", estudianteController.crearEstudiante);

// Ruta para obtener todos los Estudiantes
router.get("/", estudianteController.obtenerEstudiantes);

// Ruta para obtener el Estudiante del usuario autenticado (requiere autenticación)
router.get("/me", validarToken, estudianteController.obtenerEstudianteActual);

// Ruta para obtener un Estudiante por su ID
router.get("/:id", estudianteController.obtenerEstudiantePorId);

// Ruta para actualizar un Estudiante
router.put("/:id", estudianteController.actualizarEstudiante);

// Ruta para eliminar un Estudiante (Hard delete)
router.delete("/:id", estudianteController.eliminarEstudiante);

module.exports = router;
