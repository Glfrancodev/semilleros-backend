const express = require('express');
const multer = require('multer');
const archivoController = require('../controllers/archivo.controller');

const router = express.Router();

// Configurar Multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB por archivo
  },
  fileFilter: (req, file, cb) => {
    // Puedes agregar validaciones de tipo de archivo aquí si lo necesitas
    // Por ahora acepta cualquier tipo de archivo
    cb(null, true);
  },
});

// Rutas
/**
 * POST /api/archivos/upload
 * Subir un archivo a S3
 * Body (form-data):
 *   - file: archivo a subir
 *   - idProyecto: UUID del proyecto
 */
router.post('/upload', upload.single('file'), archivoController.subirArchivo);

/**
 * GET /api/archivos/proyecto/:idProyecto
 * Obtener todos los archivos de un proyecto
 */
router.get('/proyecto/:idProyecto', archivoController.obtenerArchivosPorProyecto);

/**
 * GET /api/archivos/:idArchivo
 * Obtener un archivo específico por ID
 */
router.get('/:idArchivo', archivoController.obtenerArchivoPorId);

/**
 * DELETE /api/archivos/:idArchivo
 * Eliminar un archivo
 */
router.delete('/:idArchivo', archivoController.eliminarArchivo);

/**
 * GET /api/archivos/:idArchivo/url-firmada
 * Generar URL firmada temporal (opcional, para mayor seguridad)
 * Query params:
 *   - expiresIn: tiempo de expiración en segundos (default: 3600)
 */
router.get('/:idArchivo/url-firmada', archivoController.generarUrlFirmada);

module.exports = router;
