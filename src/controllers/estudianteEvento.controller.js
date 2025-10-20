const estudianteEventoService = require("../services/estudianteEvento.service");

// Crear un nuevo EstudianteEvento
const crearEstudianteEvento = async (req, res, next) => {
  try {
    const nuevoEstudianteEvento =
      await estudianteEventoService.crearEstudianteEvento(req.body);
    return res.success(
      "EstudianteEvento creado exitosamente",
      nuevoEstudianteEvento,
      201
    );
  } catch (err) {
    console.error("Error al crear EstudianteEvento:", err);
    return res.error("Error al crear el EstudianteEvento", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los EstudianteEventos
const obtenerEstudianteEventos = async (req, res, next) => {
  try {
    const estudianteEventos =
      await estudianteEventoService.obtenerEstudianteEventos();
    return res.success("EstudianteEventos obtenidos exitosamente", {
      count: estudianteEventos.length,
      items: estudianteEventos,
    });
  } catch (err) {
    console.error("Error al obtener EstudianteEventos:", err);
    return res.error("Error al obtener los EstudianteEventos", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un EstudianteEvento por ID
const obtenerEstudianteEventoPorId = async (req, res, next) => {
  try {
    const estudianteEvento =
      await estudianteEventoService.obtenerEstudianteEventoPorId(req.params.id);
    if (!estudianteEvento) return res.notFound("EstudianteEvento");
    return res.success(
      "EstudianteEvento obtenido exitosamente",
      estudianteEvento
    );
  } catch (err) {
    console.error("Error al obtener EstudianteEvento:", err);
    return res.error("Error al obtener el EstudianteEvento", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un EstudianteEvento
const eliminarEstudianteEvento = async (req, res, next) => {
  try {
    const eliminados = await estudianteEventoService.eliminarEstudianteEvento(
      req.params.id
    );
    if (eliminados === 0) return res.notFound("EstudianteEvento");
    return res.success("EstudianteEvento eliminado exitosamente", {
      idEstudianteEvento: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar EstudianteEvento:", err);
    return res.error("Error al eliminar el EstudianteEvento", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearEstudianteEvento,
  obtenerEstudianteEventos,
  obtenerEstudianteEventoPorId,
  eliminarEstudianteEvento,
};
