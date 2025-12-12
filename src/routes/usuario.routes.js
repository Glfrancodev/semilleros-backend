const express = require("express");
const multer = require("multer");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const { validarToken, validarTokenOpcional } = require("../middleware/authMiddleware");

// Configurar Multer para foto de perfil
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB para fotos
  },
  fileFilter: (req, file, cb) => {
    // Validar que sea una imagen
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen"));
    }
  },
});

// Ruta para crear un nuevo usuario
router.post("/", validarTokenOpcional, usuarioController.crearUsuario);

// Ruta para obtener todos los usuarios
router.get("/", usuarioController.obtenerUsuarios);

// Ruta de Login
router.post("/login", usuarioController.login); // Agregado

// Ruta para obtener el perfil del usuario logeado
router.get("/perfil", validarToken, usuarioController.obtenerPerfil);

// Ruta para actualizar foto de perfil del usuario autenticado
router.post(
  "/perfil/foto",
  validarToken,
  upload.single("foto"),
  usuarioController.actualizarFotoPerfil
);

// Ruta para obtener un usuario por su ID
router.get("/:id", usuarioController.obtenerUsuarioPorId);

// Ruta para actualizar un usuario
router.put("/:id", validarTokenOpcional, usuarioController.actualizarUsuario);

// Ruta para cambiar el estado (soft delete) de un usuario
router.patch("/:id/estado", usuarioController.toggleEstadoUsuario);

module.exports = router;
