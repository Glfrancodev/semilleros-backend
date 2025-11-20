const express = require("express");
const router = express.Router();
const tareaController = require("../controllers/tarea.controller");
const { validarToken } = require("../middleware/authMiddleware");

// Todas las rutas de tarea requieren autenticación
router.use(validarToken);

// Rutas CRUD para Tarea
router.post("/", tareaController.crearTarea);
router.get("/orden/cero", tareaController.obtenerTareasOrdenCero);
router.get("/feria/:idFeria", tareaController.obtenerTareasPorFeria);
router.get("/inscripcion", tareaController.obtenerTareasInscripcion);
router.get("/", tareaController.obtenerTareas);
router.get("/:idTarea", tareaController.obtenerTareaPorId);
router.get("/:idTarea/detalle", tareaController.obtenerDetalleTarea);
router.put("/:idTarea", tareaController.actualizarTarea);
router.delete("/:idTarea", tareaController.eliminarTarea);

module.exports = router;
