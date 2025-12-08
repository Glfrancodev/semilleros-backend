const express = require("express");
const feriaController = require("../controllers/feria.controller");

const router = express.Router();

// GET /api/ferias/resumen-activa - Resumen de la feria activa
router.get("/resumen-activa", feriaController.obtenerResumenFeriaActiva);

// GET /api/ferias/activa - Obtener feria activa con estadísticas
router.get("/activa", feriaController.obtenerFeriaActiva);

// GET /api/ferias/pasadas - Obtener ferias pasadas (inactivas)
router.get("/pasadas", feriaController.obtenerFeriasPasadas);

// POST /api/ferias - Crear feria
router.post("/", feriaController.crearFeria);

// GET /api/ferias - Obtener todas las ferias
router.get("/", feriaController.obtenerFerias);

// PUT /api/ferias/:idFeria - Actualizar feria
router.put("/:idFeria", feriaController.actualizarFeria);

// POST /api/ferias/:idFeria/finalizar - Finalizar feria y calcular ganadores
router.post("/:idFeria/finalizar", feriaController.finalizarFeria);

// GET /api/ferias/:idFeria/proyectos-finales - Obtener proyectos finales de la feria
router.get(
  "/:idFeria/proyectos-finales",
  feriaController.obtenerProyectosFinalesFeria
);

// DELETE /api/ferias/:idFeria - Eliminar feria
router.delete("/:idFeria", feriaController.eliminarFeria);

// GET /api/ferias/:idFeria - Obtener feria por ID
router.get("/:idFeria", feriaController.obtenerFeriaPorId);

module.exports = router;
