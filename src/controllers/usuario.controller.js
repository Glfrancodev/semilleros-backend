const usuarioService = require('../services/usuario.service');
const authService = require('../services/auth.service');

// Crear Usuario
const crearUsuario = async (req, res, next) => {
  try {
    const nuevoUsuario = await usuarioService.crearUsuario(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    next(err);
  }
};

// Obtener todos los Usuarios
const obtenerUsuarios = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
};

// Obtener Usuario por ID
const obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
};

// Actualizar Usuario
const actualizarUsuario = async (req, res, next) => {
  try {
    const [actualizados] = await usuarioService.actualizarUsuario(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Soft delete de Usuario (toggle 'estaActivo')
const toggleEstadoUsuario = async (req, res, next) => {
  try {
    await usuarioService.toggleEstadoUsuario(req.params.id);
    res.json({ mensaje: 'Estado de usuario actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Login (autenticación)
const login = async (req, res, next) => {
  const { correo, contrasena } = req.body;
  try {
    const token = await authService.login(correo, contrasena);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  toggleEstadoUsuario,
  login,  // Agregado
};
