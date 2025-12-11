const express = require("express");
const router = express.Router();
const areaController = require("../controllers/area.controller");

const { validarToken } = require("../middleware/authMiddleware");

// Rutas CRUD para Area
router.post("/", validarToken, areaController.crearArea);
router.get("/", areaController.obtenerAreas);

// Ruta para obtener categorías por área (debe ir antes de /:idArea)
router.get("/:idArea/categorias", areaController.obtenerCategoriasPorArea);

router.get("/:idArea", areaController.obtenerAreaPorId);
router.put("/:idArea", validarToken, areaController.actualizarArea);
router.delete("/:idArea", validarToken, areaController.eliminarArea);

module.exports = router;
