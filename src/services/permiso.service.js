const { Permiso } = require('../models');

// Crear un nuevo Permiso
const crearPermiso = async (datos) => {
  const fechaActual = new Date();  // Obtener la fecha actual
  return await Permiso.create({
    ...datos,
    fechaCreacion: fechaActual,  // Asignar la fecha de creación manualmente
    fechaActualizacion: fechaActual,  // Asignar la misma fecha para actualización
  });
};

// Obtener todos los Permisos
const obtenerPermisos = async () => {
  return await Permiso.findAll();
};

// Obtener un Permiso por su ID
const obtenerPermisoPorId = async (idPermiso) => {
  return await Permiso.findByPk(idPermiso);
};

// Actualizar un Permiso
const actualizarPermiso = async (idPermiso, datos) => {
  const fechaActual = new Date();  // Obtener la fecha actual
  return await Permiso.update(
    {
      ...datos,
      fechaActualizacion: fechaActual,  // Actualizar la fecha de actualización
    },
    { where: { idPermiso } }
  );
};

// Eliminar un Permiso
const eliminarPermiso = async (idPermiso) => {
  return await Permiso.destroy({ where: { idPermiso } });
};

module.exports = {
  crearPermiso,
  obtenerPermisos,
  obtenerPermisoPorId,
  actualizarPermiso,
  eliminarPermiso,
};
