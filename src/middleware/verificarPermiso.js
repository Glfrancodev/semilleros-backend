const jwt = require("jsonwebtoken");
const { Rol, Permiso, RolPermiso } = require("../models");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Definir la clave secreta

// Middleware para verificar si el usuario tiene el permiso necesario
const verificarPermiso = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      // Verifica si el token existe
      const token = req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null;
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }

      // Decodificar el token para obtener el rol del usuario
      const decoded = jwt.verify(token, JWT_SECRET);
      const rol = decoded.rol; // Obtener el 'rol' desde el token (no 'idRol')

      // Buscar el permiso "Crear rol" en la base de datos
      const permiso = await Permiso.findOne({
        where: { descripcion: permisoRequerido },
      });
      if (!permiso) {
        return res
          .status(404)
          .json({ error: `Permiso "${permisoRequerido}" no encontrado` });
      }

      // Buscar si el rol del usuario tiene el permiso requerido
      const rolPermiso = await RolPermiso.findOne({
        where: {
          idRol: rol, // Usamos 'rol' aquí en lugar de 'idRol'
          idPermiso: permiso.idPermiso,
        },
      });

      if (!rolPermiso) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para realizar esta acción" });
      }

      // Si tiene el permiso, continuar con la ejecución de la ruta
      next();
    } catch (err) {
      return res.status(401).json({ error: "No autorizado" });
    }
  };
};

module.exports = { verificarPermiso };
