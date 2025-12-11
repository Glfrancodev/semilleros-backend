const express = require('express');
const categoriaController = require('../controllers/categoria.controller');

const router = express.Router();

const { validarToken } = require("../middleware/authMiddleware");

// POST /api/categorias - Crear categoría
router.post('/', validarToken, categoriaController.crearCategoria);

// GET /api/categorias - Obtener todas las categorías
router.get('/', categoriaController.obtenerCategorias);

// GET /api/categorias/:idCategoria - Obtener categoría por ID
router.get('/:idCategoria', categoriaController.obtenerCategoriaPorId);

// PUT /api/categorias/:idCategoria - Actualizar categoría
router.put('/:idCategoria', validarToken, categoriaController.actualizarCategoria);

// DELETE /api/categorias/:idCategoria - Eliminar categoría
router.delete('/:idCategoria', validarToken, categoriaController.eliminarCategoria);

module.exports = router;
