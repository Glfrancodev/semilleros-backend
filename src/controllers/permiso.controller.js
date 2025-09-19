const permisoService = require('../services/permiso.service');

const crearPermiso = async (req, res, next) => {
  try {
    const nuevoPermiso = await permisoService.crearPermiso(req.body);
    res.status(201).json(nuevoPermiso);
  } catch (err) {
    next(err);
  }
};

const obtenerPermisos = async (req, res, next) => {
  try {
    const permisos = await permisoService.obtenerPermisos();
    res.json(permisos);
  } catch (err) {
    next(err);
  }
};

const obtenerPermisoPorId = async (req, res, next) => {
  try {
    const permiso = await permisoService.obtenerPermisoPorId(req.params.id);
    if (!permiso) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json(permiso);
  } catch (err) {
    next(err);
  }
};

const actualizarPermiso = async (req, res, next) => {
  try {
    const [actualizados] = await permisoService.actualizarPermiso(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json({ mensaje: 'Permiso actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

const eliminarPermiso = async (req, res, next) => {
  try {
    const eliminados = await permisoService.eliminarPermiso(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json({ mensaje: 'Permiso eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearPermiso,
  obtenerPermisos,
  obtenerPermisoPorId,
  actualizarPermiso,
  eliminarPermiso,
};
