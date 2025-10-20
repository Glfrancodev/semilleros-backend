const permisoService = require("../services/permiso.service");

const crearPermiso = async (req, res, next) => {
  try {
    const nuevoPermiso = await permisoService.crearPermiso(req.body);
    return res.success("Permiso creado exitosamente", nuevoPermiso, 201);
  } catch (err) {
    console.error("Error al crear permiso:", err);
    return res.error("Error al crear el permiso", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

const obtenerPermisos = async (req, res, next) => {
  try {
    const permisos = await permisoService.obtenerPermisos();
    return res.success("Permisos obtenidos exitosamente", {
      count: permisos.length,
      items: permisos,
    });
  } catch (err) {
    console.error("Error al obtener permisos:", err);
    return res.error("Error al obtener los permisos", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

const obtenerPermisoPorId = async (req, res, next) => {
  try {
    const permiso = await permisoService.obtenerPermisoPorId(req.params.id);
    if (!permiso) return res.notFound("Permiso");
    return res.success("Permiso obtenido exitosamente", permiso);
  } catch (err) {
    console.error("Error al obtener permiso:", err);
    return res.error("Error al obtener el permiso", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

const actualizarPermiso = async (req, res, next) => {
  try {
    const [actualizados] = await permisoService.actualizarPermiso(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Permiso");

    const permisoActualizado = await permisoService.obtenerPermisoPorId(
      req.params.id
    );
    return res.success("Permiso actualizado exitosamente", permisoActualizado);
  } catch (err) {
    console.error("Error al actualizar permiso:", err);
    return res.error("Error al actualizar el permiso", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

const eliminarPermiso = async (req, res, next) => {
  try {
    const eliminados = await permisoService.eliminarPermiso(req.params.id);
    if (eliminados === 0) return res.notFound("Permiso");
    return res.success("Permiso eliminado exitosamente", {
      idPermiso: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar permiso:", err);
    return res.error("Error al eliminar el permiso", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearPermiso,
  obtenerPermisos,
  obtenerPermisoPorId,
  actualizarPermiso,
  eliminarPermiso,
};
