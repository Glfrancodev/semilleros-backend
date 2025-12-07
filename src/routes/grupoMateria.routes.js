const express = require("express");
const router = express.Router();
const grupoMateriaController = require("../controllers/grupoMateria.controller");
const { validarToken } = require("../middleware/authMiddleware");

// Ruta para crear una nueva GrupoMateria
router.post("/", grupoMateriaController.crearGrupoMateria);

// Ruta para obtener todos los GrupoMateria
router.get("/", grupoMateriaController.obtenerGrupoMaterias);

// Ruta para buscar GrupoMateria por grupo y materia (debe ir antes de /:id)
router.get(
  "/buscar",
  grupoMateriaController.buscarGrupoMateriaPorGrupoYMateria
);

// Ruta para obtener materias del docente autenticado (debe ir antes de /:id)
router.get(
  "/mis-materias",
  validarToken,
  grupoMateriaController.obtenerMateriasDelDocente
);

// Ruta para obtener un GrupoMateria por su ID
router.get("/:id", grupoMateriaController.obtenerGrupoMateriaPorId);

// Ruta para actualizar una GrupoMateria
router.put("/:id", grupoMateriaController.actualizarGrupoMateria);

// Ruta para eliminar una GrupoMateria (Hard delete)
router.delete("/:id", grupoMateriaController.eliminarGrupoMateria);

module.exports = router;
