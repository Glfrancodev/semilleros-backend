const { Administrativo, Estudiante, Docente } = require("../models");

// Crear un nuevo Administrativo
const crearAdministrativo = async (datos) => {
  const fechaActual = new Date();

  // Verificar si el usuario ya está asociado con un Estudiante
  const estudianteExistente = await Estudiante.findOne({
    where: { idUsuario: datos.idUsuario },
  });

  if (estudianteExistente) {
    throw new Error(
      "Este usuario ya está asociado a un Estudiante. No puede ser Administrativo."
    );
  }

  // Verificar si el usuario ya está asociado con un Docente
  const docenteExistente = await Docente.findOne({
    where: { idUsuario: datos.idUsuario },
  });

  if (docenteExistente) {
    throw new Error(
      "Este usuario ya está asociado a un Docente. No puede ser Administrativo."
    );
  }

  return await Administrativo.create({
    ...datos,
    fechaCreacion: fechaActual,
    fechaActualizacion: fechaActual,
  });
};

// Obtener todos los Administrativos
const obtenerAdministrativos = async () => {
  const db = require("../models");
  const { Usuario } = db;

  return await Administrativo.findAll({
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["idUsuario", "nombre", "apellido", "correo", "ci", "estaActivo"],
      },
    ],
  });
};

// Obtener un Administrativo por ID
const obtenerAdministrativoPorId = async (idAdministrativo) => {
  return await Administrativo.findByPk(idAdministrativo);
};

// Obtener un Administrativo por idUsuario
const obtenerAdministrativoPorUsuario = async (idUsuario) => {
  return await Administrativo.findOne({
    where: { idUsuario },
  });
};

// Obtener un Administrativo por código
const obtenerAdministrativoPorCodigo = async (codigoAdministrativo) => {
  return await Administrativo.findOne({
    where: { codigoAdministrativo },
  });
};

// Actualizar un Administrativo
const actualizarAdministrativo = async (idAdministrativo, datos) => {
  const fechaActual = new Date();
  return await Administrativo.update(
    { ...datos, fechaActualizacion: fechaActual },
    { where: { idAdministrativo } }
  );
};

// Eliminar un Administrativo (Hard delete)
const eliminarAdministrativo = async (idAdministrativo) => {
  return await Administrativo.destroy({ where: { idAdministrativo } });
};

module.exports = {
  crearAdministrativo,
  obtenerAdministrativos,
  obtenerAdministrativoPorId,
  obtenerAdministrativoPorUsuario,
  obtenerAdministrativoPorCodigo,
  actualizarAdministrativo,
  eliminarAdministrativo,
};
