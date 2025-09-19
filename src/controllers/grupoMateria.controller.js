const grupoMateriaService = require('../services/grupoMateria.service');

// Crear una nueva GrupoMateria
const crearGrupoMateria = async (req, res, next) => {
  try {
    const nuevoGrupoMateria = await grupoMateriaService.crearGrupoMateria(req.body);
    res.status(201).json(nuevoGrupoMateria);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los GrupoMateria
const obtenerGrupoMaterias = async (req, res, next) => {
  try {
    const grupoMaterias = await grupoMateriaService.obtenerGrupoMaterias();
    res.json(grupoMaterias);
  } catch (err) {
    next(err);
  }
};

// Obtener un GrupoMateria por ID
const obtenerGrupoMateriaPorId = async (req, res, next) => {
  try {
    const grupoMateria = await grupoMateriaService.obtenerGrupoMateriaPorId(req.params.id);
    if (!grupoMateria) return res.status(404).json({ error: 'GrupoMateria no encontrada' });
    res.json(grupoMateria);
  } catch (err) {
    next(err);
  }
};

// Actualizar un GrupoMateria
const actualizarGrupoMateria = async (req, res, next) => {
  try {
    const [actualizados] = await grupoMateriaService.actualizarGrupoMateria(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'GrupoMateria no encontrada' });
    res.json({ mensaje: 'GrupoMateria actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar un GrupoMateria (Hard delete)
const eliminarGrupoMateria = async (req, res, next) => {
  try {
    const eliminados = await grupoMateriaService.eliminarGrupoMateria(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'GrupoMateria no encontrada' });
    res.json({ mensaje: 'GrupoMateria eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearGrupoMateria,
  obtenerGrupoMaterias,
  obtenerGrupoMateriaPorId,
  actualizarGrupoMateria,
  eliminarGrupoMateria,
};
