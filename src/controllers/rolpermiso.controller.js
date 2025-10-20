const rolPermisoService = require("../services/rolpermiso.service");

const crearRolPermiso = async (req, res, next) => {
  try {
    const { idRol, idPermiso } = req.body;
    const nuevoRolPermiso = await rolPermisoService.crearRolPermiso(
      idRol,
      idPermiso
    );
    return res.success("RolPermiso creado exitosamente", nuevoRolPermiso, 201);
  } catch (err) {
    console.error("Error al crear RolPermiso:", err);
    return res.error("Error al crear el RolPermiso", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

const obtenerRolPermisos = async (req, res, next) => {
  try {
    const rolPermisos = await rolPermisoService.obtenerRolPermisos();
    return res.success("RolPermisos obtenidos exitosamente", {
      count: rolPermisos.length,
      items: rolPermisos,
    });
  } catch (err) {
    console.error("Error al obtener RolPermisos:", err);
    return res.error("Error al obtener los RolPermisos", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

const obtenerRolPermisoPorId = async (req, res, next) => {
  try {
    const rolPermiso = await rolPermisoService.obtenerRolPermisoPorId(
      req.params.id
    );
    if (!rolPermiso) return res.notFound("RolPermiso");
    return res.success("RolPermiso obtenido exitosamente", rolPermiso);
  } catch (err) {
    console.error("Error al obtener RolPermiso:", err);
    return res.error("Error al obtener el RolPermiso", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

const eliminarRolPermiso = async (req, res, next) => {
  try {
    const eliminados = await rolPermisoService.eliminarRolPermiso(
      req.params.id
    );
    if (eliminados === 0) return res.notFound("RolPermiso");
    return res.success("RolPermiso eliminado exitosamente", {
      idRolPermiso: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar RolPermiso:", err);
    return res.error("Error al eliminar el RolPermiso", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearRolPermiso,
  obtenerRolPermisos,
  obtenerRolPermisoPorId,
  eliminarRolPermiso,
};
