const { Docente, Estudiante } = require('../models');

// Crear un nuevo Docente
const crearDocente = async (datos) => {
  const fechaActual = new Date();

  // Verificar si el usuario ya está asociado con un Estudiante
  const usuarioExistente = await Estudiante.findOne({
    where: { idUsuario: datos.idUsuario },
  });

  if (usuarioExistente) {
    throw new Error('Este usuario ya está asociado a un Estudiante. No puede ser Docente.');
  }

  return await Docente.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los Docentes
const obtenerDocentes = async () => {
  return await Docente.findAll();
};

// Obtener un Docente por ID
const obtenerDocentePorId = async (idDocente) => {
  return await Docente.findByPk(idDocente);
};

// Actualizar un Docente
const actualizarDocente = async (idDocente, datos) => {
  const fechaActual = new Date();
  return await Docente.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idDocente } }
  );
};

// Eliminar un Docente (Hard delete)
const eliminarDocente = async (idDocente) => {
  return await Docente.destroy({ where: { idDocente } });
};

module.exports = {
  crearDocente,
  obtenerDocentes,
  obtenerDocentePorId,
  actualizarDocente,
  eliminarDocente,
};
