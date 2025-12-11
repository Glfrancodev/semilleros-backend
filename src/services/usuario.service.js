const {
  Usuario,
  Rol,
  Estudiante,
  Docente,
  Administrativo,
  Archivo,
} = require("../models");
const archivoService = require("./archivo.service");

// Crear un nuevo Usuario
const crearUsuario = async (datos) => {
  return await Usuario.create(datos);
};

// Obtener todos los Usuarios
const obtenerUsuarios = async () => {
  const usuarios = await Usuario.findAll({
    include: [
      { model: Rol, as: "Rol" },
      { model: Estudiante, as: "Estudiante" },
      { model: Docente, as: "Docente" },
      { model: Administrativo, as: "Administrativo" },
      {
        model: Archivo,
        as: "fotoPerfil",
        attributes: ["idArchivo", "url", "formato"],
      },
    ],
  });

  // Generar URLs firmadas para las fotos de perfil
  const usuariosConFotosFirmadas = await Promise.all(
    usuarios.map(async (usuario) => {
      const usuarioJSON = usuario.toJSON();

      if (usuarioJSON.fotoPerfil && usuarioJSON.fotoPerfil.idArchivo) {
        try {
          const { url: urlFirmada } = await archivoService.generarUrlFirmada(
            usuarioJSON.fotoPerfil.idArchivo,
            604800 // 7 días en segundos
          );
          usuarioJSON.fotoPerfil.url = urlFirmada;
        } catch (error) {
          console.error(
            `Error al generar URL firmada para usuario ${usuarioJSON.idUsuario}:`,
            error
          );
          // Si falla, mantener la URL original (aunque no funcione)
        }
      }

      return usuarioJSON;
    })
  );

  return usuariosConFotosFirmadas;
};

// Obtener un Usuario por su ID (con relaciones)
const obtenerUsuarioPorId = async (idUsuario) => {
  const usuario = await Usuario.findByPk(idUsuario, {
    include: [
      { model: Rol, as: "Rol" },
      { model: Estudiante, as: "Estudiante" },
      { model: Docente, as: "Docente" },
      { model: Administrativo, as: "Administrativo" },
      {
        model: Archivo,
        as: "fotoPerfil",
        attributes: ["idArchivo", "url", "formato"],
      },
    ],
  });

  if (!usuario) return null;

  const usuarioJSON = usuario.toJSON();

  // Generar URL firmada para la foto de perfil
  if (usuarioJSON.fotoPerfil && usuarioJSON.fotoPerfil.idArchivo) {
    try {
      const { url: urlFirmada } = await archivoService.generarUrlFirmada(
        usuarioJSON.fotoPerfil.idArchivo,
        604800 // 7 días en segundos
      );
      usuarioJSON.fotoPerfil.url = urlFirmada;
    } catch (error) {
      console.error(
        `Error al generar URL firmada para usuario ${usuarioJSON.idUsuario}:`,
        error
      );
    }
  }

  return usuarioJSON;
};

// Actualizar un Usuario
const actualizarUsuario = async (idUsuario, datos) => {
  return await Usuario.update(datos, { where: { idUsuario } });
};

// Soft delete de un Usuario (cambiar el estado de 'estaActivo')
const toggleEstadoUsuario = async (idUsuario) => {
  const usuario = await Usuario.findByPk(idUsuario);
  if (!usuario) throw new Error("Usuario no encontrado");

  // Toggle del estado 'estaActivo' (de true a false o viceversa)
  const nuevoEstado = !usuario.estaActivo;
  return await Usuario.update(
    { estaActivo: nuevoEstado },
    { where: { idUsuario } }
  );
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  toggleEstadoUsuario, // Agregado
};
