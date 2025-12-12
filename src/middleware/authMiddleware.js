const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware para validar el token JWT y asignar el payload a req.user
const validarToken = (req, res, next) => {
  try {
    // Verificar si el token está presente en los encabezados
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Asignar el payload del token a req.user
    req.user = decoded;

    next(); // Continuar con la siguiente función middleware o controlador
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

const validarTokenOpcional = (req, res, next) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // Si el token es inválido, simplemente no asignamos req.user
    // No devolvemos error para permitir acceso público
    console.warn("Token inválido en ruta opcional:", err.message);
  }
  next();
};

module.exports = { validarToken, validarTokenOpcional };
