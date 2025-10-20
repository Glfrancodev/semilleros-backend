const express = require("express");
const router = express.Router();
const areaController = require("../controllers/area.controller");

// Rutas CRUD para Area
router.post("/", areaController.crearArea);
router.get("/", areaController.obtenerAreas);
router.get("/:idArea", areaController.obtenerAreaPorId);
router.put("/:idArea", areaController.actualizarArea);
router.delete("/:idArea", areaController.eliminarArea);

module.exports = router;
