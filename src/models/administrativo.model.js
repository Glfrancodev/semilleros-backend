module.exports = (sequelize, DataTypes) => {
  const Administrativo = sequelize.define(
    'Administrativo',
    {
      idAdministrativo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      codigoAdministrativo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      fechaActualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      // Foreign Key to Usuario
      idUsuario: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'Administrativo',
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  Administrativo.associate = (models) => {
    // Relación con la tabla Usuario (Administrativo -> Usuario)
    Administrativo.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: { name: 'idUsuario', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Administrativo;
};
