const semestreService = require('../services/semestre.service');

// Crear un nuevo Semestre
const crearSemestre = async (req, res, next) => {
  try {
    const nuevoSemestre = await semestreService.crearSemestre(req.body);
    res.status(201).json(nuevoSemestre);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los Semestres
const obtenerSemestres = async (req, res, next) => {
  try {
    const semestres = await semestreService.obtenerSemestres();
    res.json(semestres);
  } catch (err) {
    next(err);
  }
};

// Obtener un Semestre por ID
const obtenerSemestrePorId = async (req, res, next) => {
  try {
    const semestre = await semestreService.obtenerSemestrePorId(req.params.id);
    if (!semestre) return res.status(404).json({ error: 'Semestre no encontrado' });
    res.json(semestre);
  } catch (err) {
    next(err);
  }
};

// Actualizar un Semestre
const actualizarSemestre = async (req, res, next) => {
  try {
    const [actualizados] = await semestreService.actualizarSemestre(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Semestre no encontrado' });
    res.json({ mensaje: 'Semestre actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar un Semestre (Hard delete)
const eliminarSemestre = async (req, res, next) => {
  try {
    const eliminados = await semestreService.eliminarSemestre(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Semestre no encontrado' });
    res.json({ mensaje: 'Semestre eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearSemestre,
  obtenerSemestres,
  obtenerSemestrePorId,
  actualizarSemestre,
  eliminarSemestre,
};
