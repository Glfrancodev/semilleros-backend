module.exports = (sequelize, DataTypes) => {
  const Permiso = sequelize.define(
    'Permiso',
    {
      idPermiso: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
    },
    {
      tableName: 'Permiso',
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  Permiso.associate = (models) => {
    Permiso.hasMany(models.RolPermiso, {
      as: 'rolPermisos',
      foreignKey: { name: 'idPermiso', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Permiso;
};
