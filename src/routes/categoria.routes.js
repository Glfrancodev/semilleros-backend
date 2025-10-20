const express = require('express');
const categoriaController = require('../controllers/categoria.controller');

const router = express.Router();

// POST /api/categorias - Crear categoría
router.post('/', categoriaController.crearCategoria);

// GET /api/categorias - Obtener todas las categorías
router.get('/', categoriaController.obtenerCategorias);

// GET /api/categorias/:idCategoria - Obtener categoría por ID
router.get('/:idCategoria', categoriaController.obtenerCategoriaPorId);

// PUT /api/categorias/:idCategoria - Actualizar categoría
router.put('/:idCategoria', categoriaController.actualizarCategoria);

// DELETE /api/categorias/:idCategoria - Eliminar categoría
router.delete('/:idCategoria', categoriaController.eliminarCategoria);

module.exports = router;
