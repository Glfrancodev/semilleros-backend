const { Permiso, Rol, RolPermiso } = require('../models');

// Seeder para permisos
const seedPermisos = async (req, res, next) => {
  const permisos = req.body; // Esperamos una lista de permisos
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
  const roles = req.body; // Esperamos una lista de roles [{nombre: 'Admin'}, ...]
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

module.exports = {
  seedPermisos,
  seedRoles
};
