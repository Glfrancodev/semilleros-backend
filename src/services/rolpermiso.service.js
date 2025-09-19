const { RolPermiso } = require('../models');

// Crear un nuevo RolPermiso
const crearRolPermiso = async (idRol, idPermiso) => {
  const fechaActual = new Date();  // Obtener la fecha actual
  return await RolPermiso.create({
    idRol,
    idPermiso,
    fechaCreacion: fechaActual,  // Asignar la fecha de creación manualmente
    fechaActualizacion: fechaActual,  // Asignar la misma fecha para actualización
  });
};

// Obtener todos los RolPermisos
const obtenerRolPermisos = async () => {
  return await RolPermiso.findAll();
};

// Obtener un RolPermiso por su ID
const obtenerRolPermisoPorId = async (idRolPermiso) => {
  return await RolPermiso.findByPk(idRolPermiso);
};

// Eliminar un RolPermiso
const eliminarRolPermiso = async (idRolPermiso) => {
  return await RolPermiso.destroy({ where: { idRolPermiso } });
};

module.exports = {
  crearRolPermiso,
  obtenerRolPermisos,
  obtenerRolPermisoPorId,
  eliminarRolPermiso,
};
