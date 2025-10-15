const { Permiso, Rol, RolPermiso, Usuario } = require('../models');

// Seeder para permisos
const seedPermisos = async (req, res, next) => {
  const permisos = req.body;
  try {
    const permisosCreados = await Permiso.bulkCreate(permisos, { returning: true });

    const rolAdministrador = await Rol.findOne({ where: { nombre: 'Administrador' } });

    if (rolAdministrador) {
      for (let permiso of permisosCreados) {
        await RolPermiso.create({
          idRol: rolAdministrador.idRol,
          idPermiso: permiso.idPermiso,
        });
      }
    }

    res.status(201).json({ message: 'Permisos creados y asociados correctamente', permisosCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para roles
const seedRoles = async (req, res, next) => {
  const roles = req.body;
  try {
    const fechaActual = new Date();

    const rolesCreados = await Rol.bulkCreate(
      roles.map(r => ({
        ...r,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Roles creados correctamente', rolesCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para usuarios
const seedUsuarios = async (req, res, next) => {
  const usuarios = req.body; // Esperamos una lista [{nombre, correo, contrasena, idRol}, ...]
  try {
    const fechaActual = new Date();

    const usuariosCreados = await Usuario.bulkCreate(
      usuarios.map(u => ({
        ...u,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Usuarios creados correctamente', usuariosCreados });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  seedPermisos,
  seedRoles,
  seedUsuarios
};
