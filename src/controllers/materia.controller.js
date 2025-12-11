const materiaService = require("../services/materia.service");

// Crear una nueva Materia
const crearMateria = async (req, res, next) => {
  try {
    // 1. Obtener idAdministrativo del usuario autenticado (igual que Categoria)
    const { Usuario, Administrativo } = require("../models");
    const usuario = await Usuario.findByPk(req.user.idUsuario, {
      include: [{ model: Administrativo, as: "Administrativo" }],
    });
    const idAdministrativo = usuario?.Administrativo?.idAdministrativo;

    console.log("DEBUG - Creating Materia - Found idAdministrativo:", idAdministrativo);

    const nuevaMateria = await materiaService.crearMateria({
      ...req.body,
      creadoPor: idAdministrativo,
      actualizadoPor: idAdministrativo,
    });
    return res.success("Materia creada exitosamente", nuevaMateria, 201);
  } catch (err) {
    console.error("Error al crear materia:", err);
    return res.error("Error al crear la materia", 500, {
      code: "CREATE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todas las Materias
const obtenerMaterias = async (req, res, next) => {
  try {
    const materias = await materiaService.obtenerMaterias();
    return res.success("Materias obtenidas exitosamente", {
      count: materias.length,
      items: materias,
    });
  } catch (err) {
    console.error("Error al obtener materias:", err);
    return res.error("Error al obtener las materias", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener materias por semestre
const obtenerMateriasPorSemestre = async (req, res, next) => {
  try {
    const { idSemestre } = req.params;
    const materias = await materiaService.obtenerMateriasPorSemestre(
      idSemestre
    );
    return res.success("Materias del semestre obtenidas exitosamente", {
      count: materias.length,
      items: materias,
    });
  } catch (err) {
    console.error("Error al obtener materias por semestre:", err);
    return res.error("Error al obtener las materias del semestre", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Obtener una Materia por ID
const obtenerMateriaPorId = async (req, res, next) => {
  try {
    const materia = await materiaService.obtenerMateriaPorId(req.params.id);
    if (!materia) return res.notFound("Materia");
    return res.success("Materia obtenida exitosamente", materia);
  } catch (err) {
    console.error("Error al obtener materia:", err);
    return res.error("Error al obtener la materia", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

// Actualizar una Materia
const actualizarMateria = async (req, res, next) => {
  try {
    // 1. Obtener idAdministrativo del usuario autenticado (igual que Categoria)
    const { Usuario, Administrativo } = require("../models");
    const usuario = await Usuario.findByPk(req.user.idUsuario, {
      include: [{ model: Administrativo, as: "Administrativo" }],
    });
    const idAdministrativo = usuario?.Administrativo?.idAdministrativo;

    console.log("DEBUG - Updating Materia - Found idAdministrativo:", idAdministrativo);

    const [actualizados] = await materiaService.actualizarMateria(req.params.id, {
      ...req.body,
      actualizadoPor: idAdministrativo,
    });
    if (actualizados === 0) return res.notFound("Materia");

    const materiaActualizada = await materiaService.obtenerMateriaPorId(
      req.params.id
    );
    return res.success("Materia actualizada exitosamente", materiaActualizada);
  } catch (err) {
    console.error("Error al actualizar materia:", err);
    return res.error("Error al actualizar la materia", 500, {
      code: "UPDATE_ERROR",
      details: err.message,
    });
  }
};

// Eliminar una Materia (Hard delete)
const eliminarMateria = async (req, res, next) => {
  try {
    const eliminados = await materiaService.eliminarMateria(req.params.id);
    if (eliminados === 0) return res.notFound("Materia");
    return res.success("Materia eliminada exitosamente", {
      idMateria: req.params.id,
    });
  } catch (err) {
    console.error("Error al eliminar materia:", err);
    return res.error("Error al eliminar la materia", 500, {
      code: "DELETE_ERROR",
      details: err.message,
    });
  }
};

// Obtener todos los grupos de una materia
const obtenerGruposPorMateria = async (req, res, next) => {
  try {
    const grupos = await materiaService.obtenerGruposPorMateria(req.params.id);
    return res.success("Grupos obtenidos exitosamente", {
      count: grupos.length,
      items: grupos,
    });
  } catch (err) {
    console.error("Error al obtener grupos por materia:", err);

    if (err.message === "Materia no encontrada") {
      return res.notFound("Materia");
    }

    return res.error("Error al obtener los grupos", 500, {
      code: "FETCH_ERROR",
      details: err.message,
    });
  }
};

module.exports = {
  crearMateria,
  obtenerMaterias,
  obtenerMateriasPorSemestre,
  obtenerMateriaPorId,
  actualizarMateria,
  eliminarMateria,
  obtenerGruposPorMateria,
};
