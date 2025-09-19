const estudianteService = require('../services/estudiante.service');

// Crear un nuevo Estudiante
const crearEstudiante = async (req, res, next) => {
  try {
    const nuevoEstudiante = await estudianteService.crearEstudiante(req.body);
    res.status(201).json(nuevoEstudiante);
  } catch (err) {
    // Si hay un error relacionado con el usuario ya asociado, lo capturamos
    if (err.message.includes('usuario ya está asociado a un Docente')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// Obtener todos los Estudiantes
const obtenerEstudiantes = async (req, res, next) => {
  try {
    const estudiantes = await estudianteService.obtenerEstudiantes();
    res.json(estudiantes);
  } catch (err) {
    next(err);
  }
};

// Obtener un Estudiante por ID
const obtenerEstudiantePorId = async (req, res, next) => {
  try {
    const estudiante = await estudianteService.obtenerEstudiantePorId(req.params.id);
    if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json(estudiante);
  } catch (err) {
    next(err);
  }
};

// Actualizar un Estudiante
const actualizarEstudiante = async (req, res, next) => {
  try {
    const [actualizados] = await estudianteService.actualizarEstudiante(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json({ mensaje: 'Estudiante actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar un Estudiante (Hard delete)
const eliminarEstudiante = async (req, res, next) => {
  try {
    const eliminados = await estudianteService.eliminarEstudiante(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json({ mensaje: 'Estudiante eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearEstudiante,
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  actualizarEstudiante,
  eliminarEstudiante,
};
