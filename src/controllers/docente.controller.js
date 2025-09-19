const docenteService = require('../services/docente.service');

// Crear un nuevo Docente
const crearDocente = async (req, res, next) => {
  try {
    const nuevoDocente = await docenteService.crearDocente(req.body);
    res.status(201).json(nuevoDocente);
  } catch (err) {
    // Si hay un error relacionado con el usuario ya asociado, lo capturamos
    if (err.message.includes('usuario ya está asociado a un Estudiante')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// Obtener todos los Docentes
const obtenerDocentes = async (req, res, next) => {
  try {
    const docentes = await docenteService.obtenerDocentes();
    res.json(docentes);
  } catch (err) {
    next(err);
  }
};

// Obtener un Docente por ID
const obtenerDocentePorId = async (req, res, next) => {
  try {
    const docente = await docenteService.obtenerDocentePorId(req.params.id);
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json(docente);
  } catch (err) {
    next(err);
  }
};

// Actualizar un Docente
const actualizarDocente = async (req, res, next) => {
  try {
    const [actualizados] = await docenteService.actualizarDocente(req.params.id, req.body);
    if (actualizados === 0) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json({ mensaje: 'Docente actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar un Docente (Hard delete)
const eliminarDocente = async (req, res, next) => {
  try {
    const eliminados = await docenteService.eliminarDocente(req.params.id);
    if (eliminados === 0) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json({ mensaje: 'Docente eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearDocente,
  obtenerDocentes,
  obtenerDocentePorId,
  actualizarDocente,
  eliminarDocente,
};
