const { Rol } = require('../models');

// Crear un nuevo Rol
const crearRol = async (datos) => {
  const fechaActual = new Date();  // Obtener la fecha actual
  return await Rol.create({
    ...datos,
    fechaCreacion: fechaActual,  // Asignar la fecha de creación manualmente
    fechaActualizacion: fechaActual,  // Asignar la misma fecha para actualización
  });
};

// Obtener todos los Roles
const obtenerRoles = async () => {
  return await Rol.findAll();
};

// Obtener un Rol por su ID
const obtenerRolPorId = async (idRol) => {
  return await Rol.findByPk(idRol);
};

// Actualizar un Rol
const actualizarRol = async (idRol, datos) => {
  const fechaActual = new Date();  // Obtener la fecha actual
  return await Rol.update(
    {
      ...datos,
      fechaActualizacion: fechaActual,  // Actualizar la fecha de actualización
    },
    { where: { idRol } }
  );
};

// Eliminar un Rol
const eliminarRol = async (idRol) => {
  return await Rol.destroy({ where: { idRol } });
};

module.exports = {
  crearRol,
  obtenerRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
};
