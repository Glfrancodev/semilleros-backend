const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Definir la clave secreta

// Función para login (autenticación)
const login = async (correo, contrasena) => {

  // Buscar el usuario por correo, usando el scope 'login' para obtener la contraseña
  const usuario = await Usuario.scope('login').findOne({ where: { correo } });

  // Si el usuario no existe, lanzar un error
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar si la contraseña es válida
  const esValido = await bcrypt.compare(contrasena, usuario.contrasena);

  if (!esValido) {
    throw new Error('Contraseña incorrecta');
  }

  // Crear JWT
  const token = jwt.sign(
    { idUsuario: usuario.idUsuario, correo: usuario.correo, nombre: usuario.nombre + " " + usuario.apellido, rol: usuario.idRol}, // Datos a incluir en el token
    JWT_SECRET,
    { expiresIn: '1h' } // Expira en 1 hora
  );

  return token;
};

module.exports = { login };
