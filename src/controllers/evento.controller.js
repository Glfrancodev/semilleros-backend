const eventoService = require('../services/evento.service');

// Crear un nuevo Evento
const crearEvento = async (req, res, next) => {
  try {
    const nuevoEvento = await eventoService.crearEvento(req.body);
    res.status(201).json(nuevoEvento);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los Eventos
const obtenerEventos = async (req, res, next) => {
  try {
    const eventos = await eventoService.obtenerEventos();
    res.json(eventos);
  } catch (err) {
    next(err);
  }
};

// Obtener un Evento por ID
const obtenerEventoPorId = async (req, res, next) => {
  try {
    const evento = await eventoService.obtenerEventoPorId(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    next(err);
  }
};

// Actualizar un Evento
const actualizarEvento = async (req, res, next) => {
  try {
    const [actualizados] = await eventoService.actualizarEvento(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ mensaje: 'Evento actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar un Evento
const eliminarEvento = async (req, res, next) => {
  try {
    const eliminados = await eventoService.eliminarEvento(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ mensaje: 'Evento eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearEvento,
  obtenerEventos,
  obtenerEventoPorId,
  actualizarEvento,
  eliminarEvento,
};
