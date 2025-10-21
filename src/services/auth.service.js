const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario, Archivo } = require("../models");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Definir la clave secreta

// Configurar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Función auxiliar para generar URL firmada
const generarUrlFirmadaDesdeBucket = async (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const key = urlObj.pathname.substring(1); // Remover el '/' inicial

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    // URL válida por 7 días
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 604800,
    });
    return signedUrl;
  } catch (error) {
    console.error("Error generando URL firmada:", error);
    return null;
  }
};

// Función para login (autenticación)
const login = async (correo, contrasena) => {
  // Buscar el usuario por correo, usando el scope 'login' para obtener la contraseña
  const usuario = await Usuario.scope("login").findOne({
    where: { correo },
    include: [
      {
        model: Archivo,
        as: "fotoPerfil",
        attributes: ["url"],
      },
    ],
  });

  // Si el usuario no existe, lanzar un error
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar si la contraseña es válida
  const esValido = await bcrypt.compare(contrasena, usuario.contrasena);

  if (!esValido) {
    throw new Error("Contraseña incorrecta");
  }

  // Generar iniciales del nombre y apellido
  const iniciales =
    (usuario.nombre?.charAt(0) || "") + (usuario.apellido?.charAt(0) || "");

  // Generar URL firmada para la foto de perfil
  const fotoPerfilFirmada = await generarUrlFirmadaDesdeBucket(
    usuario.fotoPerfil?.url
  );

  // Crear JWT
  const token = jwt.sign(
    {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      nombre: usuario.nombre + " " + usuario.apellido,
      iniciales: iniciales.toUpperCase(),
      fotoPerfil: fotoPerfilFirmada,
      rol: usuario.idRol,
    }, // Datos a incluir en el token
    JWT_SECRET,
    { expiresIn: "7d" } // Expira en 7 días (igual que la URL firmada)
  );

  // Obtener el usuario sin la contraseña para devolverlo
  const usuarioSinContrasena = await Usuario.findByPk(usuario.idUsuario, {
    include: [
      {
        model: Archivo,
        as: "fotoPerfil",
        attributes: ["idArchivo", "url", "formato"],
      },
    ],
  });

  return { token, usuario: usuarioSinContrasena };
};

// Función para generar un nuevo token con los datos actualizados del usuario
const refreshToken = async (idUsuario) => {
  // Buscar el usuario con su foto de perfil
  const usuario = await Usuario.findByPk(idUsuario, {
    include: [
      {
        model: Archivo,
        as: "fotoPerfil",
        attributes: ["url"],
      },
    ],
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Generar iniciales
  const iniciales =
    (usuario.nombre?.charAt(0) || "") + (usuario.apellido?.charAt(0) || "");

  // Generar URL firmada para la foto de perfil
  const fotoPerfilFirmada = await generarUrlFirmadaDesdeBucket(
    usuario.fotoPerfil?.url
  );

  // Crear nuevo JWT con datos actualizados
  const token = jwt.sign(
    {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      nombre: usuario.nombre + " " + usuario.apellido,
      iniciales: iniciales.toUpperCase(),
      fotoPerfil: fotoPerfilFirmada,
      rol: usuario.idRol,
    },
    JWT_SECRET,
    { expiresIn: "7d" } // Expira en 7 días (igual que la URL firmada)
  );

  return token;
};

module.exports = { login, refreshToken };
