const express = require("express");
const router = express.Router();
const materiaController = require("../controllers/materia.controller");

// Ruta para crear una nueva Materia
router.post("/", materiaController.crearMateria);

// Ruta para obtener todas las Materias
router.get("/", materiaController.obtenerMaterias);

// Ruta para obtener grupos por materia (debe ir antes de /:id)
router.get("/:id/grupos", materiaController.obtenerGruposPorMateria);

// Ruta para obtener una Materia por su ID
router.get("/:id", materiaController.obtenerMateriaPorId);

// Ruta para actualizar una Materia
router.put("/:id", materiaController.actualizarMateria);

// Ruta para eliminar una Materia (Hard delete)
router.delete("/:id", materiaController.eliminarMateria);

module.exports = router;
