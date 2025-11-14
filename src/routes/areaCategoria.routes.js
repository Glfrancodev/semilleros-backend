const express = require("express");
const router = express.Router();
const areaCategoriaController = require("../controllers/areaCategoria.controller");

// Rutas CRUD para AreaCategoria
router.post("/", areaCategoriaController.crearAreaCategoria);
router.get("/", areaCategoriaController.obtenerAreaCategorias);

// Ruta para buscar AreaCategoria por área y categoría (debe ir antes de /:idAreaCategoria)
router.get(
  "/buscar",
  areaCategoriaController.buscarAreaCategoriaPorAreaYCategoria
);

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

// Ruta para obtener materias por área-categoría
router.get(
  "/:idAreaCategoria/materias",
  areaCategoriaController.obtenerMateriasPorAreaCategoria
);

module.exports = router;
