const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware para validar el token JWT y asignar el payload a req.user
const validarToken = (req, res, next) => {
  try {
    // Verificar si el token está presente en los encabezados
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Asignar el payload del token a req.user
    req.user = decoded;

    console.log('Decoded JWT payload:', decoded);

    next(); // Continuar con la siguiente función middleware o controlador
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = { validarToken };