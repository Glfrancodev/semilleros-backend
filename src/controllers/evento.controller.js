const eventoService = require("../services/evento.service");

// Crear un nuevo Evento
const crearEvento = async (req, res, next) => {
  try {
    const nuevoEvento = await eventoService.crearEvento(req.body);
    return res.success("Evento creado exitosamente", nuevoEvento, 201);
  } catch (err) {
    console.error("Error al crear evento:", err);
    return res.error("Error al crear el evento", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los Eventos
const obtenerEventos = async (req, res, next) => {
  try {
    const eventos = await eventoService.obtenerEventos();
    return res.success("Eventos obtenidos exitosamente", {
      count: eventos.length,
      items: eventos,
    });
  } catch (err) {
    console.error("Error al obtener eventos:", err);
    return res.error("Error al obtener los eventos", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener un Evento por ID
const obtenerEventoPorId = async (req, res, next) => {
  try {
    const evento = await eventoService.obtenerEventoPorId(req.params.id);
    if (!evento) return res.notFound("Evento");
    return res.success("Evento obtenido exitosamente", evento);
  } catch (err) {
    console.error("Error al obtener evento:", err);
    return res.error("Error al obtener el evento", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar un Evento
const actualizarEvento = async (req, res, next) => {
  try {
    const [actualizados] = await eventoService.actualizarEvento(
      req.params.id,
      req.body
    );
    if (actualizados === 0) return res.notFound("Evento");

    const eventoActualizado = await eventoService.obtenerEventoPorId(
      req.params.id
    );
    return res.success("Evento actualizado exitosamente", eventoActualizado);
  } catch (err) {
    console.error("Error al actualizar evento:", err);
    return res.error("Error al actualizar el evento", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar un Evento
const eliminarEvento = async (req, res, next) => {
  try {
    const eliminados = await eventoService.eliminarEvento(req.params.id);
    if (eliminados === 0) return res.notFound("Evento");
    return res.success("Evento eliminado exitosamente", {
      idEvento: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar evento:", err);
    return res.error("Error al eliminar el evento", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearEvento,
  obtenerEventos,
  obtenerEventoPorId,
  actualizarEvento,
  eliminarEvento,
};
