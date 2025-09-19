const { Permiso, Rol, RolPermiso } = require('../models');

// Controlador para poblar los permisos
const seedPermisos = async (req, res, next) => {
  const permisos = req.body; // Esperamos una lista de permisos

  try {
    // Crear los permisos en la base de datos
    const permisosCreados = await Permiso.bulkCreate(permisos, {
      returning: true,  // Para obtener los permisos creados con sus ids
    });

    // Asociar los permisos al rol "Administrador"
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

// Puedes agregar más métodos aquí para poblar otras entidades como Roles, Usuarios, etc.

module.exports = {
  seedPermisos,
};
