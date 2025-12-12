const usuarioService = require("../services/usuario.service");
const authService = require("../services/auth.service");
const archivoService = require("../services/archivo.service");
const administrativoService = require("../services/administrativo.service");

// Crear Usuario
const crearUsuario = async (req, res, next) => {
  try {
    let idAdministrativo = null;
    if (req.user) {
      const admin = await administrativoService.obtenerAdministrativoPorUsuario(
        req.user.idUsuario
      );
      if (admin) {
        idAdministrativo = admin.idAdministrativo;
      }
    }

    const nuevoUsuario = await usuarioService.crearUsuario({
      ...req.body,
      creadoPor: idAdministrativo,
      actualizadoPor: idAdministrativo,
    });
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
    let idAdministrativo = null;
    if (req.user) {
      const admin = await administrativoService.obtenerAdministrativoPorUsuario(
        req.user.idUsuario
      );
      if (admin) {
        idAdministrativo = admin.idAdministrativo;
      }
    }

    const [actualizados] = await usuarioService.actualizarUsuario(
      req.params.id,
      {
        ...req.body,
        actualizadoPor: idAdministrativo,
      }
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

// Actualizar foto de perfil del usuario autenticado
const actualizarFotoPerfil = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.validationError("No se ha proporcionado ningún archivo");
    }

    const idUsuario = req.user.idUsuario;

    // Buscar si el usuario ya tiene una foto de perfil
    const usuarioConFoto = await usuarioService.obtenerUsuarioPorId(idUsuario);
    const idFotoAnterior = usuarioConFoto.idFotoPerfil;

    // Subir la nueva foto a S3 y crear registro en BD
    const archivoNuevo = await archivoService.subirFotoPerfil(
      req.file,
      idUsuario
    );

    // Actualizar el usuario para que apunte a la nueva foto
    await usuarioService.actualizarUsuario(idUsuario, {
      idFotoPerfil: archivoNuevo.idArchivo,
    });

    // Si tenía foto anterior, eliminarla de S3 y BD
    if (idFotoAnterior) {
      try {
        await archivoService.eliminarArchivo(idFotoAnterior);
        console.log("Foto de perfil anterior eliminada:", idFotoAnterior);
      } catch (deleteError) {
        console.error("Error al eliminar foto anterior:", deleteError);
        // Continuar aunque falle la eliminación de la foto anterior
      }
    }

    // Generar URL firmada para la foto (válida por 7 días)
    const { url: urlFirmada, expiresIn } =
      await archivoService.generarUrlFirmada(
        archivoNuevo.idArchivo,
        604800 // 7 días en segundos
      );

    // Generar nuevo token con la URL firmada actualizada
    const nuevoToken = await authService.refreshToken(idUsuario);

    return res.success("Foto de perfil actualizada exitosamente", {
      token: nuevoToken,
      fotoPerfil: {
        ...archivoNuevo.toJSON(),
        urlFirmada,
        expiraEn: `${expiresIn / 86400} días`,
      },
    });
  } catch (err) {
    console.error("Error al actualizar foto de perfil:", err);
    return res.error("Error al actualizar la foto de perfil", 500, {
      code: "UPDATE_PHOTO_ERROR",
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
  login,
  actualizarFotoPerfil, // Nuevo
};
