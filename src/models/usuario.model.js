const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      idUsuario: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ci: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { notEmpty: true },
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      instagram: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkedin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      github: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      estaActivo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      fechaActualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'Usuario',
      freezeTableName: true,
      timestamps: false,
      defaultScope: {
        // Excluir la contraseña por defecto
        attributes: { exclude: ['contrasena'] },
      },
      scopes: {
        // Scope específico para login (incluir 'contrasena' en las consultas de login)
        login: {
          attributes: { include: ['contrasena'] },
        },
      },
    }
  );

  // Hook para encriptar la contraseña antes de crear el usuario
  Usuario.beforeCreate(async (usuario) => {
    if (usuario.contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
    }
  });

  // Hook para encriptar la contraseña antes de actualizar el usuario
  Usuario.beforeUpdate(async (usuario) => {
    if (usuario.contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
    }
  });

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Rol, {
      as: 'rol',
      foreignKey: { name: 'idRol', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Usuario;
};
