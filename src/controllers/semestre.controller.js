const semestreService = require("../services/semestre.service");

// Crear un nuevo Semestre
const crearSemestre = async (req, res, next) => {
  try {
    const nuevoSemestre = await semestreService.crearSemestre(req.body);
    return res.success("Semestre creado exitosamente", nuevoSemestre, 201);
  } catch (err) {
    console.error("Error al crear semestre:", err);
    return res.error("Error al crear el semestre", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los Semestres
const obtenerSemestres = async (req, res, next) => {
  try {
    const semestres = await semestreService.obtenerSemestres();
    return res.success("Semestres obtenidos exitosamente", {
      count: semestres.length,
      items: semestres,
    });
  } catch (err) {
    console.error("Error al obtener semestres:", err);
    return res.error("Error al obtener los semestres", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un Semestre por ID
const obtenerSemestrePorId = async (req, res, next) => {
  try {
    const semestre = await semestreService.obtenerSemestrePorId(req.params.id);
    if (!semestre) return res.notFound("Semestre");
    return res.success("Semestre obtenido exitosamente", semestre);
  } catch (err) {
    console.error("Error al obtener semestre:", err);
    return res.error("Error al obtener el semestre", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar un Semestre
const actualizarSemestre = async (req, res, next) => {
  try {
    const [actualizados] = await semestreService.actualizarSemestre(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Semestre");

    const semestreActualizado = await semestreService.obtenerSemestrePorId(
      req.params.id
    );
    return res.success(
      "Semestre actualizado exitosamente",
      semestreActualizado
    );
  } catch (err) {
    console.error("Error al actualizar semestre:", err);
    return res.error("Error al actualizar el semestre", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un Semestre (Hard delete)
const eliminarSemestre = async (req, res, next) => {
  try {
    const eliminados = await semestreService.eliminarSemestre(req.params.id);
    if (eliminados === 0) return res.notFound("Semestre");
    return res.success("Semestre eliminado exitosamente", {
      idSemestre: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar semestre:", err);
    return res.error("Error al eliminar el semestre", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearSemestre,
  obtenerSemestres,
  obtenerSemestrePorId,
  actualizarSemestre,
  eliminarSemestre,
};
