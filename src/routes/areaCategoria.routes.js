const express = require("express");
const router = express.Router();
const areaCategoriaController = require("../controllers/areaCategoria.controller");

// Rutas CRUD para AreaCategoria
router.post("/", areaCategoriaController.crearAreaCategoria);
router.get("/", areaCategoriaController.obtenerAreaCategorias);
router.get(
  "/:idAreaCategoria",
  areaCategoriaController.obtenerAreaCategoriaPorId
);
router.get(
  "/area/:idArea",
  areaCategoriaController.obtenerAreaCategoriasPorArea
);
router.get(
  "/categoria/:idCategoria",
  areaCategoriaController.obtenerAreaCategoriasPorCategoria
);
router.put(
  "/:idAreaCategoria",
  areaCategoriaController.actualizarAreaCategoria
);
router.delete(
  "/:idAreaCategoria",
  areaCategoriaController.eliminarAreaCategoria
);

module.exports = router;
