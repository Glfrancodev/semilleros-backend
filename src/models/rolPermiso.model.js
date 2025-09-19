module.exports = (sequelize, DataTypes) => {
  const RolPermiso = sequelize.define(
    'RolPermiso',
    {
      idRolPermiso: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      tableName: 'RolPermiso',
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  RolPermiso.associate = (models) => {
    RolPermiso.belongsTo(models.Rol, {
      as: 'rol',
      foreignKey: { name: 'idRol', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    RolPermiso.belongsTo(models.Permiso, {
      as: 'permiso',
      foreignKey: { name: 'idPermiso', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return RolPermiso;
};
