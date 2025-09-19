const rolService = require('../services/rol.service');

const crearRol = async (req, res, next) => {
  try {
    const nuevoRol = await rolService.crearRol(req.body);
    res.status(201).json(nuevoRol);
  } catch (err) {
    next(err);
  }
};

const obtenerRoles = async (req, res, next) => {
  try {
    const roles = await rolService.obtenerRoles();
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

const obtenerRolPorId = async (req, res, next) => {
  try {
    const rol = await rolService.obtenerRolPorId(req.params.id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(rol);
  } catch (err) {
    next(err);
  }
};

const actualizarRol = async (req, res, next) => {
  try {
    const [actualizados] = await rolService.actualizarRol(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json({ mensaje: 'Rol actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

const eliminarRol = async (req, res, next) => {
  try {
    const eliminados = await rolService.eliminarRol(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json({ mensaje: 'Rol eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearRol,
  obtenerRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
};
