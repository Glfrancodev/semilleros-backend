const usuarioService = require("../services/usuario.service");
const authService = require("../services/auth.service");

// Crear Usuario
const crearUsuario = async (req, res, next) => {
  try {
    const nuevoUsuario = await usuarioService.crearUsuario(req.body);
    return res.success("Usuario creado exitosamente", nuevoUsuario, 201);
  } catch (err) {
    console.error("Error al crear usuario:", err);
    return res.error("Error al crear el usuario", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los Usuarios
const obtenerUsuarios = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();
    return res.success("Usuarios obtenidos exitosamente", {
      count: usuarios.length,
      items: usuarios,
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return res.error("Error al obtener los usuarios", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener Usuario por ID
const obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);
    if (!usuario) return res.notFound("Usuario");
    return res.success("Usuario obtenido exitosamente", usuario);
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    return res.error("Error al obtener el usuario", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener perfil del usuario logeado
const obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(
      req.user.idUsuario
    );
    if (!usuario) return res.notFound("Usuario");
    return res.success("Perfil obtenido exitosamente", usuario);
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    return res.error("Error al obtener el perfil", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar Usuario
const actualizarUsuario = async (req, res, next) => {
  try {
    const [actualizados] = await usuarioService.actualizarUsuario(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Usuario");

    const usuarioActualizado = await usuarioService.obtenerUsuarioPorId(
      req.params.id
    );
    return res.success("Usuario actualizado exitosamente", usuarioActualizado);
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    return res.error("Error al actualizar el usuario", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Soft delete de Usuario (toggle 'estaActivo')
const toggleEstadoUsuario = async (req, res, next) => {
  try {
    await usuarioService.toggleEstadoUsuario(req.params.id);
    const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);
    return res.success("Estado de usuario actualizado exitosamente", usuario);
  } catch (err) {
    console.error("Error al actualizar estado de usuario:", err);
    return res.error("Error al actualizar el estado del usuario", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Login (autenticación)
const login = async (req, res, next) => {
  const { correo, contrasena } = req.body;
  try {
    if (!correo || !contrasena) {
      return res.validationError(
        "Los campos correo y contraseña son requeridos"
      );
    }

    const { token, usuario } = await authService.login(correo, contrasena);
    return res.success("Inicio de sesión exitoso", { token, user: usuario });
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    if (
      err.message === "Credenciales inválidas" ||
      err.message === "Usuario no encontrado"
    ) {
      return res.unauthorized("Credenciales incorrectas");
    }
    return res.error("Error al iniciar sesión", 500, {
      code: "LOGIN_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerPerfil,
  actualizarUsuario,
  toggleEstadoUsuario,
  login, // Agregado
};
