const administrativoService = require("../services/administrativo.service");

// Crear un nuevo Administrativo
const crearAdministrativo = async (req, res, next) => {
  try {
    let idCreador = null;
    if (req.user) {
      const admin = await administrativoService.obtenerAdministrativoPorUsuario(
        req.user.idUsuario
      );
      if (admin) {
        idCreador = admin.idAdministrativo;
      }
    }

    const nuevoAdministrativo = await administrativoService.crearAdministrativo({
      ...req.body,
      creadoPor: idCreador,
      actualizadoPor: idCreador,
    });
    return res.success("Administrativo creado exitosamente", nuevoAdministrativo, 201);
  } catch (err) {
    console.error("Error al crear administrativo:", err);
    // Si hay un error relacionado con el usuario ya asociado, lo capturamos
    if (err.message.includes("usuario ya está asociado")) {
      return res.validationError(err.message);
    }
    return res.error("Error al crear el administrativo", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los Administrativos
const obtenerAdministrativos = async (req, res, next) => {
  try {
    const administrativos = await administrativoService.obtenerAdministrativos();
    return res.success("Administrativos obtenidos exitosamente", {
      count: administrativos.length,
      items: administrativos,
    });
  } catch (err) {
    console.error("Error al obtener administrativos:", err);
    return res.error("Error al obtener los administrativos", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un Administrativo por ID
const obtenerAdministrativoPorId = async (req, res, next) => {
  try {
    const administrativo = await administrativoService.obtenerAdministrativoPorId(req.params.id);
    if (!administrativo) return res.notFound("Administrativo");
    return res.success("Administrativo obtenido exitosamente", administrativo);
  } catch (err) {
    console.error("Error al obtener administrativo:", err);
    return res.error("Error al obtener el administrativo", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar un Administrativo
const actualizarAdministrativo = async (req, res, next) => {
  try {
    let idActualizador = null;
    if (req.user) {
      const admin = await administrativoService.obtenerAdministrativoPorUsuario(
        req.user.idUsuario
      );
      if (admin) {
        idActualizador = admin.idAdministrativo;
      }
    }

    const [actualizados] = await administrativoService.actualizarAdministrativo(
      req.params.id,
      {
        ...req.body,
        actualizadoPor: idActualizador,
      }
    );
    if (actualizados === 0) return res.notFound("Administrativo");

    const administrativoActualizado = await administrativoService.obtenerAdministrativoPorId(req.params.id);
    return res.success("Administrativo actualizado exitosamente", administrativoActualizado);
  } catch (err) {
    console.error("Error al actualizar administrativo:", err);
    return res.error("Error al actualizar el administrativo", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un Administrativo (Hard delete)
const eliminarAdministrativo = async (req, res, next) => {
  try {
    const eliminados = await administrativoService.eliminarAdministrativo(req.params.id);
    if (eliminados === 0) return res.notFound("Administrativo");
    return res.success("Administrativo eliminado exitosamente", {
      idAdministrativo: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar administrativo:", err);
    return res.error("Error al eliminar el administrativo", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearAdministrativo,
  obtenerAdministrativos,
  obtenerAdministrativoPorId,
  actualizarAdministrativo,
  eliminarAdministrativo,
};
