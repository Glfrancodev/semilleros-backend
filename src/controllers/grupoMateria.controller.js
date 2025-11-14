const grupoMateriaService = require("../services/grupoMateria.service");

// Crear una nueva GrupoMateria
const crearGrupoMateria = async (req, res, next) => {
  try {
    const nuevoGrupoMateria = await grupoMateriaService.crearGrupoMateria(
      req.body
    );
    return res.success(
      "GrupoMateria creado exitosamente",
      nuevoGrupoMateria,
      201
    );
  } catch (err) {
    console.error("Error al crear GrupoMateria:", err);
    return res.error("Error al crear el GrupoMateria", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los GrupoMateria
const obtenerGrupoMaterias = async (req, res, next) => {
  try {
    const grupoMaterias = await grupoMateriaService.obtenerGrupoMaterias();
    return res.success("GrupoMaterias obtenidos exitosamente", {
      count: grupoMaterias.length,
      items: grupoMaterias,
    });
  } catch (err) {
    console.error("Error al obtener GrupoMaterias:", err);
    return res.error("Error al obtener los GrupoMaterias", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un GrupoMateria por ID
const obtenerGrupoMateriaPorId = async (req, res, next) => {
  try {
    const grupoMateria = await grupoMateriaService.obtenerGrupoMateriaPorId(
      req.params.id
    );
    if (!grupoMateria) return res.notFound("GrupoMateria");
    return res.success("GrupoMateria obtenido exitosamente", grupoMateria);
  } catch (err) {
    console.error("Error al obtener GrupoMateria:", err);
    return res.error("Error al obtener el GrupoMateria", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar un GrupoMateria
const actualizarGrupoMateria = async (req, res, next) => {
  try {
    const [actualizados] = await grupoMateriaService.actualizarGrupoMateria(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("GrupoMateria");

    const grupoMateriaActualizado =
      await grupoMateriaService.obtenerGrupoMateriaPorId(req.params.id);
    return res.success(
      "GrupoMateria actualizado exitosamente",
      grupoMateriaActualizado
    );
  } catch (err) {
    console.error("Error al actualizar GrupoMateria:", err);
    return res.error("Error al actualizar el GrupoMateria", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un GrupoMateria (Hard delete)
const eliminarGrupoMateria = async (req, res, next) => {
  try {
    const eliminados = await grupoMateriaService.eliminarGrupoMateria(
      req.params.id
    );
    if (eliminados === 0) return res.notFound("GrupoMateria");
    return res.success("GrupoMateria eliminado exitosamente", {
      idGrupoMateria: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar GrupoMateria:", err);
    return res.error("Error al eliminar el GrupoMateria", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

// Buscar GrupoMateria por idGrupo e idMateria
const buscarGrupoMateriaPorGrupoYMateria = async (req, res, next) => {
  try {
    const { idGrupo, idMateria } = req.query;

    if (!idGrupo || !idMateria) {
      return res.validationError(
        "Los parámetros idGrupo e idMateria son requeridos"
      );
    }

    const grupoMateria =
      await grupoMateriaService.buscarGrupoMateriaPorGrupoYMateria(
        idGrupo,
        idMateria
      );
    return res.success("GrupoMateria encontrado exitosamente", grupoMateria);
  } catch (err) {
    console.error("Error al buscar GrupoMateria:", err);

    if (err.message === "GrupoMateria no encontrado") {
      return res.notFound("GrupoMateria");
    }

    return res.error("Error al buscar el GrupoMateria", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearGrupoMateria,
  obtenerGrupoMaterias,
  obtenerGrupoMateriaPorId,
  actualizarGrupoMateria,
  eliminarGrupoMateria,
  buscarGrupoMateriaPorGrupoYMateria,
};
