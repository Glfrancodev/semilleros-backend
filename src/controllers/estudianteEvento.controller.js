const estudianteEventoService = require('../services/estudianteEvento.service');

// Crear un nuevo EstudianteEvento
const crearEstudianteEvento = async (req, res, next) => {
  try {
    const nuevoEstudianteEvento = await estudianteEventoService.crearEstudianteEvento(req.body);
    res.status(201).json(nuevoEstudianteEvento);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los EstudianteEventos
const obtenerEstudianteEventos = async (req, res, next) => {
  try {
    const estudianteEventos = await estudianteEventoService.obtenerEstudianteEventos();
    res.json(estudianteEventos);
  } catch (err) {
    next(err);
  }
};

// Obtener un EstudianteEvento por ID
const obtenerEstudianteEventoPorId = async (req, res, next) => {
  try {
    const estudianteEvento = await estudianteEventoService.obtenerEstudianteEventoPorId(req.params.id);
    if (!estudianteEvento) return res.status(404).json({ error: 'EstudianteEvento no encontrado' });
    res.json(estudianteEvento);
  } catch (err) {
    next(err);
  }
};

// Eliminar un EstudianteEvento
const eliminarEstudianteEvento = async (req, res, next) => {
  try {
    const eliminados = await estudianteEventoService.eliminarEstudianteEvento(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'EstudianteEvento no encontrado' });
    res.json({ mensaje: 'EstudianteEvento eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearEstudianteEvento,
  obtenerEstudianteEventos,
  obtenerEstudianteEventoPorId,
  eliminarEstudianteEvento,
};
