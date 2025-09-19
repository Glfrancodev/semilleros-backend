const materiaService = require('../services/materia.service');

// Crear una nueva Materia
const crearMateria = async (req, res, next) => {
  try {
    const nuevaMateria = await materiaService.crearMateria(req.body);
    res.status(201).json(nuevaMateria);
  } catch (err) {
    next(err);
  }
};

// Obtener todas las Materias
const obtenerMaterias = async (req, res, next) => {
  try {
    const materias = await materiaService.obtenerMaterias();
    res.json(materias);
  } catch (err) {
    next(err);
  }
};

// Obtener una Materia por ID
const obtenerMateriaPorId = async (req, res, next) => {
  try {
    const materia = await materiaService.obtenerMateriaPorId(req.params.id);
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json(materia);
  } catch (err) {
    next(err);
  }
};

// Actualizar una Materia
const actualizarMateria = async (req, res, next) => {
  try {
    const [actualizados] = await materiaService.actualizarMateria(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json({ mensaje: 'Materia actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar una Materia (Hard delete)
const eliminarMateria = async (req, res, next) => {
  try {
    const eliminados = await materiaService.eliminarMateria(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json({ mensaje: 'Materia eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearMateria,
  obtenerMaterias,
  obtenerMateriaPorId,
  actualizarMateria,
  eliminarMateria,
};
