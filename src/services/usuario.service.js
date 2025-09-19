const { Usuario } = require('../models');

// Crear un nuevo Usuario
const crearUsuario = async (datos) => {
  return await Usuario.create(datos);
};

// Obtener todos los Usuarios
const obtenerUsuarios = async () => {
  return await Usuario.findAll();
};

// Obtener un Usuario por su ID
const obtenerUsuarioPorId = async (idUsuario) => {
  return await Usuario.findByPk(idUsuario);
};

// Actualizar un Usuario
const actualizarUsuario = async (idUsuario, datos) => {
  return await Usuario.update(datos, { where: { idUsuario } });
};

// Soft delete de un Usuario (cambiar el estado de 'estaActivo')
const toggleEstadoUsuario = async (idUsuario) => {
  const usuario = await Usuario.findByPk(idUsuario);
  if (!usuario) throw new Error('Usuario no encontrado');

  // Toggle del estado 'estaActivo' (de true a false o viceversa)
  const nuevoEstado = !usuario.estaActivo;
  return await Usuario.update({ estaActivo: nuevoEstado }, { where: { idUsuario } });
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  toggleEstadoUsuario,  // Agregado
};
