const rolPermisoService = require('../services/rolpermiso.service');

const crearRolPermiso = async (req, res, next) => {
  try {
    const { idRol, idPermiso } = req.body;
    const nuevoRolPermiso = await rolPermisoService.crearRolPermiso(idRol, idPermiso);
    res.status(201).json(nuevoRolPermiso);
  } catch (err) {
    next(err);
  }
};

const obtenerRolPermisos = async (req, res, next) => {
  try {
    const rolPermisos = await rolPermisoService.obtenerRolPermisos();
    res.json(rolPermisos);
  } catch (err) {
    next(err);
  }
};

const obtenerRolPermisoPorId = async (req, res, next) => {
  try {
    const rolPermiso = await rolPermisoService.obtenerRolPermisoPorId(req.params.id);
    if (!rolPermiso) return res.status(404).json({ error: 'RolPermiso no encontrado' });
    res.json(rolPermiso);
  } catch (err) {
    next(err);
  }
};

const eliminarRolPermiso = async (req, res, next) => {
  try {
    const eliminados = await rolPermisoService.eliminarRolPermiso(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'RolPermiso no encontrado' });
    res.json({ mensaje: 'RolPermiso eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearRolPermiso,
  obtenerRolPermisos,
  obtenerRolPermisoPorId,
  eliminarRolPermiso,
};
