const sequelize = require('../config/database'); // usar el mismo sequelize
const { DataTypes } = require('sequelize');

// Importar modelos
const Rol = require('./rol.model')(sequelize, DataTypes);
const Permiso = require('./permiso.model')(sequelize, DataTypes);
const RolPermiso = require('./rolPermiso.model')(sequelize, DataTypes);
const Usuario = require('./usuario.model')(sequelize, DataTypes);  // Agregado
const Estudiante = require('./estudiante.model')(sequelize, DataTypes);  // Agregado
const Evento = require('./evento.model')(sequelize, DataTypes);  // Agregado
const EstudianteEvento = require('./estudianteEvento.model')(sequelize, DataTypes);  // Agregado

// Meter todos los modelos en un objeto
const db = {
  sequelize,
  Rol,
  Permiso,
  RolPermiso,
  Usuario,        // Agregado
  Estudiante,     // Agregado
  Evento,         // Agregado
  EstudianteEvento // Agregado
};

// Ejecutar sus asociaciones (si tienen associate definido)
Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

// Exportar todo para que lo uses desde tu backend
module.exports = db;
