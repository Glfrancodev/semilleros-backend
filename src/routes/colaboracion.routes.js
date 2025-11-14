const express = require("express");
const router = express.Router();
const colaboracionController = require("../controllers/colaboracion.controller");
const { validarToken } = require("../middleware/authMiddleware");

// Todas las rutas requieren autenticación
router.use(validarToken);

// Guardar contenido (auto-guardado)
router.post(
  "/proyecto/:idProyecto/guardar",
  colaboracionController.guardarContenidoProyecto
);
router.post(
  "/revision/:idRevision/guardar",
  colaboracionController.guardarContenidoRevision
);

// Obtener contenido
router.get(
  "/proyecto/:idProyecto/contenido",
  colaboracionController.obtenerContenidoProyecto
);
router.get(
  "/revision/:idRevision/contenido",
  colaboracionController.obtenerContenidoRevision
);

// Obtener usuarios activos en un documento
router.get(
  "/activos/:documentType/:documentId",
  colaboracionController.obtenerUsuariosActivos
);

module.exports = router;
