const { 
  Permiso, 
  Rol, 
  RolPermiso, 
  Usuario,
  Semestre,
  Materia,
  Grupo,
  GrupoMateria,
  TipoCalificacion,
  SubCalificacion,
  Categoria,
  Convocatoria,
  Evento
} = require('../models');

// Seeder para permisos
const seedPermisos = async (req, res, next) => {
  const permisos = req.body;
  try {
    const permisosCreados = await Permiso.bulkCreate(permisos, { returning: true });

    const rolAdministrador = await Rol.findOne({ where: { nombre: 'Administrador' } });

    if (rolAdministrador) {
      for (let permiso of permisosCreados) {
        await RolPermiso.create({
          idRol: rolAdministrador.idRol,
          idPermiso: permiso.idPermiso,
        });
      }
    }

    res.status(201).json({ message: 'Permisos creados y asociados correctamente', permisosCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para roles
const seedRoles = async (req, res, next) => {
  const roles = req.body;
  try {
    const fechaActual = new Date();

    const rolesCreados = await Rol.bulkCreate(
      roles.map(r => ({
        ...r,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Roles creados correctamente', rolesCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para usuarios
const seedUsuarios = async (req, res, next) => {
  const usuarios = req.body; // Esperamos una lista [{nombre, correo, contrasena, idRol}, ...]
  try {
    const fechaActual = new Date();

    const usuariosCreados = await Usuario.bulkCreate(
      usuarios.map(u => ({
        ...u,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Usuarios creados correctamente', usuariosCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para semestres
const seedSemestres = async (req, res, next) => {
  const semestres = req.body;
  try {
    const fechaActual = new Date();

    const semestresCreados = await Semestre.bulkCreate(
      semestres.map(s => ({
        ...s,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Semestres creados correctamente', semestresCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para materias
const seedMaterias = async (req, res, next) => {
  const materias = req.body;
  try {
    const fechaActual = new Date();

    const materiasCreadas = await Materia.bulkCreate(
      materias.map(m => ({
        ...m,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Materias creadas correctamente', materiasCreadas });
  } catch (err) {
    next(err);
  }
};

// Seeder para grupos
const seedGrupos = async (req, res, next) => {
  const grupos = req.body;
  try {
    const fechaActual = new Date();

    const gruposCreados = await Grupo.bulkCreate(
      grupos.map(g => ({
        ...g,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Grupos creados correctamente', gruposCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para grupo-materia
const seedGrupoMaterias = async (req, res, next) => {
  const grupoMaterias = req.body;
  try {
    const fechaActual = new Date();

    const grupoMateriasCreadas = await GrupoMateria.bulkCreate(
      grupoMaterias.map(gm => ({
        ...gm,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'GrupoMaterias creados correctamente', grupoMateriasCreadas });
  } catch (err) {
    next(err);
  }
};

// Seeder para tipos de calificación
const seedTiposCalificacion = async (req, res, next) => {
  const tiposCalificacion = req.body;
  try {
    const fechaActual = new Date();

    const tiposCreados = await TipoCalificacion.bulkCreate(
      tiposCalificacion.map(tc => ({
        ...tc,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Tipos de calificación creados correctamente', tiposCreados });
  } catch (err) {
    next(err);
  }
};

// Seeder para subcalificaciones
const seedSubCalificaciones = async (req, res, next) => {
  const subCalificaciones = req.body;
  try {
    const fechaActual = new Date();

    const subCalificacionesCreadas = await SubCalificacion.bulkCreate(
      subCalificaciones.map(sc => ({
        ...sc,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Subcalificaciones creadas correctamente', subCalificacionesCreadas });
  } catch (err) {
    next(err);
  }
};

// Seeder para categorías
const seedCategorias = async (req, res, next) => {
  const categorias = req.body;
  try {
    const fechaActual = new Date();

    const categoriasCreadas = await Categoria.bulkCreate(
      categorias.map(c => ({
        ...c,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Categorías creadas correctamente', categoriasCreadas });
  } catch (err) {
    next(err);
  }
};

// Seeder para convocatorias
const seedConvocatorias = async (req, res, next) => {
  const convocatorias = req.body;
  try {
    const fechaActual = new Date();

    const convocatoriasCreadas = await Convocatoria.bulkCreate(
      convocatorias.map(c => ({
        ...c,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Convocatorias creadas correctamente', convocatoriasCreadas });
  } catch (err) {
    next(err);
  }
};

// Seeder para eventos
const seedEventos = async (req, res, next) => {
  const eventos = req.body;
  try {
    const fechaActual = new Date();

    const eventosCreados = await Evento.bulkCreate(
      eventos.map(e => ({
        ...e,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
      })),
      { returning: true }
    );

    res.status(201).json({ message: 'Eventos creados correctamente', eventosCreados });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  seedPermisos,
  seedRoles,
  seedUsuarios,
  seedSemestres,
  seedMaterias,
  seedGrupos,
  seedGrupoMaterias,
  seedTiposCalificacion,
  seedSubCalificaciones,
  seedCategorias,
  seedConvocatorias,
  seedEventos
};
