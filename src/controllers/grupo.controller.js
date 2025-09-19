const grupoService = require('../services/grupo.service');

// Crear un nuevo Grupo
const crearGrupo = async (req, res, next) => {
  try {
    const nuevoGrupo = await grupoService.crearGrupo(req.body);
    res.status(201).json(nuevoGrupo);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los Grupos
const obtenerGrupos = async (req, res, next) => {
  try {
    const grupos = await grupoService.obtenerGrupos();
    res.json(grupos);
  } catch (err) {
    next(err);
  }
};

// Obtener un Grupo por ID
const obtenerGrupoPorId = async (req, res, next) => {
  try {
    const grupo = await grupoService.obtenerGrupoPorId(req.params.id);
    if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json(grupo);
  } catch (err) {
    next(err);
  }
};

// Actualizar un Grupo
const actualizarGrupo = async (req, res, next) => {
  try {
    const [actualizados] = await grupoService.actualizarGrupo(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ mensaje: 'Grupo actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar un Grupo (Hard delete)
const eliminarGrupo = async (req, res, next) => {
  try {
    const eliminados = await grupoService.eliminarGrupo(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ mensaje: 'Grupo eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearGrupo,
  obtenerGrupos,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
};
