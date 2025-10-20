const docenteService = require("../services/docente.service");

// Crear un nuevo Docente
const crearDocente = async (req, res, next) => {
  try {
    const nuevoDocente = await docenteService.crearDocente(req.body);
    return res.success("Docente creado exitosamente", nuevoDocente, 201);
  } catch (err) {
    console.error("Error al crear docente:", err);
    // Si hay un error relacionado con el usuario ya asociado, lo capturamos
    if (err.message.includes("usuario ya está asociado a un Estudiante")) {
      return res.validationError(err.message);
    }
    return res.error("Error al crear el docente", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los Docentes
const obtenerDocentes = async (req, res, next) => {
  try {
    const docentes = await docenteService.obtenerDocentes();
    return res.success("Docentes obtenidos exitosamente", {
      count: docentes.length,
      items: docentes,
    });
  } catch (err) {
    console.error("Error al obtener docentes:", err);
    return res.error("Error al obtener los docentes", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un Docente por ID
const obtenerDocentePorId = async (req, res, next) => {
  try {
    const docente = await docenteService.obtenerDocentePorId(req.params.id);
    if (!docente) return res.notFound("Docente");
    return res.success("Docente obtenido exitosamente", docente);
  } catch (err) {
    console.error("Error al obtener docente:", err);
    return res.error("Error al obtener el docente", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar un Docente
const actualizarDocente = async (req, res, next) => {
  try {
    const [actualizados] = await docenteService.actualizarDocente(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Docente");

    const docenteActualizado = await docenteService.obtenerDocentePorId(
      req.params.id
    );
    return res.success("Docente actualizado exitosamente", docenteActualizado);
  } catch (err) {
    console.error("Error al actualizar docente:", err);
    return res.error("Error al actualizar el docente", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un Docente (Hard delete)
const eliminarDocente = async (req, res, next) => {
  try {
    const eliminados = await docenteService.eliminarDocente(req.params.id);
    if (eliminados === 0) return res.notFound("Docente");
    return res.success("Docente eliminado exitosamente", {
      idDocente: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar docente:", err);
    return res.error("Error al eliminar el docente", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearDocente,
  obtenerDocentes,
  obtenerDocentePorId,
  actualizarDocente,
  eliminarDocente,
};
