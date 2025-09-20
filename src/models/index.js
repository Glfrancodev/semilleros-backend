const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar modelos
const Rol = require('./rol.model')(sequelize, DataTypes);
const Permiso = require('./permiso.model')(sequelize, DataTypes);
const RolPermiso = require('./rolPermiso.model')(sequelize, DataTypes);
const Usuario = require('./usuario.model')(sequelize, DataTypes);
const Estudiante = require('./estudiante.model')(sequelize, DataTypes);
const Evento = require('./evento.model')(sequelize, DataTypes);
const EstudianteEvento = require('./estudianteEvento.model')(sequelize, DataTypes);
const Docente = require('./docente.model')(sequelize, DataTypes);
const Grupo = require('./grupo.model')(sequelize, DataTypes);
const GrupoMateria = require('./grupoMateria.model')(sequelize, DataTypes);
const Semestre = require('./semestre.model')(sequelize, DataTypes);
const Materia = require('./materia.model')(sequelize, DataTypes);

// Nuevos modelos añadidos
const Proyecto = require('./proyecto.model')(sequelize, DataTypes);
const Categoria = require('./categoria.model')(sequelize, DataTypes);
const Convocatoria = require('./convocatoria.model')(sequelize, DataTypes);
const EstudianteProyecto = require('./estudianteProyecto.model')(sequelize, DataTypes);
const Archivo = require('./archivo.model')(sequelize, DataTypes);
const Revision = require('./revision.model')(sequelize, DataTypes);
const Calificacion = require('./calificacion.model')(sequelize, DataTypes);
const TipoCalificacion = require('./tipoCalificacion.model')(sequelize, DataTypes);
const DocenteProyecto = require('./docenteProyecto.model')(sequelize, DataTypes);

// Meter todos los modelos en un objeto
const db = {
  sequelize,
  Rol,
  Permiso,
  RolPermiso,
  Usuario,
  Estudiante,
  Evento,
  EstudianteEvento,
  Docente,
  Grupo,
  GrupoMateria,
  Semestre,
  Materia,
  Proyecto,
  Categoria,
  Convocatoria,
  EstudianteProyecto,
  Archivo,
  Revision,
  Calificacion,
  TipoCalificacion,
  DocenteProyecto
};

// Ejecutar asociaciones
Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
