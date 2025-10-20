const rolService = require("../services/rol.service");

const crearRol = async (req, res, next) => {
  try {
    const nuevoRol = await rolService.crearRol(req.body);
    return res.success("Rol creado exitosamente", nuevoRol, 201);
  } catch (err) {
    console.error("Error al crear rol:", err);
    return res.error("Error al crear el rol", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

const obtenerRoles = async (req, res, next) => {
  try {
    const roles = await rolService.obtenerRoles();
    return res.success("Roles obtenidos exitosamente", {
      count: roles.length,
      items: roles,
    });
  } catch (err) {
    console.error("Error al obtener roles:", err);
    return res.error("Error al obtener los roles", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

const obtenerRolPorId = async (req, res, next) => {
  try {
    const rol = await rolService.obtenerRolPorId(req.params.id);
    if (!rol) return res.notFound("Rol");
    return res.success("Rol obtenido exitosamente", rol);
  } catch (err) {
    console.error("Error al obtener rol:", err);
    return res.error("Error al obtener el rol", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

const actualizarRol = async (req, res, next) => {
  try {
    const [actualizados] = await rolService.actualizarRol(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Rol");

    const rolActualizado = await rolService.obtenerRolPorId(req.params.id);
    return res.success("Rol actualizado exitosamente", rolActualizado);
  } catch (err) {
    console.error("Error al actualizar rol:", err);
    return res.error("Error al actualizar el rol", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

const eliminarRol = async (req, res, next) => {
  try {
    const eliminados = await rolService.eliminarRol(req.params.id);
    if (eliminados === 0) return res.notFound("Rol");
    return res.success("Rol eliminado exitosamente", { idRol: req.params.id });
  } catch (err) {
    console.error("Error al eliminar rol:", err);
    return res.error("Error al eliminar el rol", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearRol,
  obtenerRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
};
