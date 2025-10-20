const grupoService = require("../services/grupo.service");

// Crear un nuevo Grupo
const crearGrupo = async (req, res, next) => {
  try {
    const nuevoGrupo = await grupoService.crearGrupo(req.body);
    return res.success("Grupo creado exitosamente", nuevoGrupo, 201);
  } catch (err) {
    console.error("Error al crear grupo:", err);
    return res.error("Error al crear el grupo", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los Grupos
const obtenerGrupos = async (req, res, next) => {
  try {
    const grupos = await grupoService.obtenerGrupos();
    return res.success("Grupos obtenidos exitosamente", {
      count: grupos.length,
      items: grupos,
    });
  } catch (err) {
    console.error("Error al obtener grupos:", err);
    return res.error("Error al obtener los grupos", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un Grupo por ID
const obtenerGrupoPorId = async (req, res, next) => {
  try {
    const grupo = await grupoService.obtenerGrupoPorId(req.params.id);
    if (!grupo) return res.notFound("Grupo");
    return res.success("Grupo obtenido exitosamente", grupo);
  } catch (err) {
    console.error("Error al obtener grupo:", err);
    return res.error("Error al obtener el grupo", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar un Grupo
const actualizarGrupo = async (req, res, next) => {
  try {
    const [actualizados] = await grupoService.actualizarGrupo(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Grupo");

    const grupoActualizado = await grupoService.obtenerGrupoPorId(
      req.params.id
    );
    return res.success("Grupo actualizado exitosamente", grupoActualizado);
  } catch (err) {
    console.error("Error al actualizar grupo:", err);
    return res.error("Error al actualizar el grupo", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un Grupo (Hard delete)
const eliminarGrupo = async (req, res, next) => {
  try {
    const eliminados = await grupoService.eliminarGrupo(req.params.id);
    if (eliminados === 0) return res.notFound("Grupo");
    return res.success("Grupo eliminado exitosamente", {
      idGrupo: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar grupo:", err);
    return res.error("Error al eliminar el grupo", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearGrupo,
  obtenerGrupos,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
};
