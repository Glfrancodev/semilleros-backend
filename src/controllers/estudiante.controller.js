const estudianteService = require("../services/estudiante.service");

// Crear un nuevo Estudiante
const crearEstudiante = async (req, res, next) => {
  try {
    const nuevoEstudiante = await estudianteService.crearEstudiante(req.body);
    return res.success("Estudiante creado exitosamente", nuevoEstudiante, 201);
  } catch (err) {
    console.error("Error al crear estudiante:", err);
    // Si hay un error relacionado con el usuario ya asociado, lo capturamos
    if (err.message.includes("usuario ya está asociado a un Docente")) {
      return res.validationError(err.message);
    }
    return res.error("Error al crear el estudiante", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los Estudiantes
const obtenerEstudiantes = async (req, res, next) => {
  try {
    const estudiantes = await estudianteService.obtenerEstudiantes();
    return res.success("Estudiantes obtenidos exitosamente", {
      count: estudiantes.length,
      items: estudiantes,
    });
  } catch (err) {
    console.error("Error al obtener estudiantes:", err);
    return res.error("Error al obtener los estudiantes", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener el Estudiante del usuario autenticado
const obtenerEstudianteActual = async (req, res, next) => {
  try {
    const estudiante = await estudianteService.obtenerEstudiantePorUsuario(
      req.user.idUsuario
    );
    if (!estudiante) {
      return res.notFound("Estudiante asociado al usuario");
    }
    return res.success("Estudiante obtenido exitosamente", estudiante);
  } catch (err) {
    console.error("Error al obtener estudiante actual:", err);
    return res.error("Error al obtener el estudiante", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un Estudiante por ID
const obtenerEstudiantePorId = async (req, res, next) => {
  try {
    const estudiante = await estudianteService.obtenerEstudiantePorId(
      req.params.id
    );
    if (!estudiante) return res.notFound("Estudiante");
    return res.success("Estudiante obtenido exitosamente", estudiante);
  } catch (err) {
    console.error("Error al obtener estudiante:", err);
    return res.error("Error al obtener el estudiante", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar un Estudiante
const actualizarEstudiante = async (req, res, next) => {
  try {
    const [actualizados] = await estudianteService.actualizarEstudiante(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Estudiante");

    const estudianteActualizado =
      await estudianteService.obtenerEstudiantePorId(req.params.id);
    return res.success(
      "Estudiante actualizado exitosamente",
      estudianteActualizado
    );
  } catch (err) {
    console.error("Error al actualizar estudiante:", err);
    return res.error("Error al actualizar el estudiante", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un Estudiante (Hard delete)
const eliminarEstudiante = async (req, res, next) => {
  try {
    const eliminados = await estudianteService.eliminarEstudiante(
      req.params.id
    );
    if (eliminados === 0) return res.notFound("Estudiante");
    return res.success("Estudiante eliminado exitosamente", {
      idEstudiante: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar estudiante:", err);
    return res.error("Error al eliminar el estudiante", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

/**
 * GET /api/estudiantes/leaderboard
 * Obtiene el top de estudiantes destacados según su desempeño
 */
const obtenerLeaderboard = async (req, res) => {
  try {
    const limite = Math.min(parseInt(req.query.limite) || 10, 50);
    const leaderboard = await estudianteService.obtenerLeaderboard(limite);

    return res.success("Leaderboard obtenido exitosamente", {
      count: leaderboard.length,
      items: leaderboard,
    });
  } catch (err) {
    console.error("Error al obtener leaderboard:", err);
    return res.error("Error al obtener el leaderboard de estudiantes", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearEstudiante,
  obtenerEstudiantes,
  obtenerEstudianteActual,
  obtenerEstudiantePorId,
  actualizarEstudiante,
  eliminarEstudiante,
  obtenerLeaderboard,
};
