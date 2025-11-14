const express = require("express");
const feriaController = require("../controllers/feria.controller");

const router = express.Router();

// POST /api/ferias - Crear feria
router.post("/", feriaController.crearFeria);

// GET /api/ferias - Obtener todas las ferias
router.get("/", feriaController.obtenerFerias);

// GET /api/ferias/:idFeria - Obtener feria por ID
router.get("/:idFeria", feriaController.obtenerFeriaPorId);

// PUT /api/ferias/:idFeria - Actualizar feria
router.put("/:idFeria", feriaController.actualizarFeria);

// DELETE /api/ferias/:idFeria - Eliminar feria
router.delete("/:idFeria", feriaController.eliminarFeria);

module.exports = router;
