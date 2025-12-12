module.exports = (sequelize, DataTypes) => {
  const TipoCalificacion = sequelize.define(
    "TipoCalificacion",
    {
      idTipoCalificacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
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
      creadoPor: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Administrativo",
          key: "idAdministrativo",
        },
      },
      actualizadoPor: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Administrativo",
          key: "idAdministrativo",
        },
      },
    },
    {
      tableName: "TipoCalificacion",
      freezeTableName: true,
      timestamps: false,
    }
  );

  TipoCalificacion.associate = (models) => {
    // Relación 1 a muchos con SubCalificacion
    TipoCalificacion.hasMany(models.SubCalificacion, {
      as: "subCalificaciones",
      foreignKey: { name: "idTipoCalificacion", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Auditoría
    TipoCalificacion.belongsTo(models.Administrativo, {
      as: "creador",
      foreignKey: "creadoPor",
    });

    TipoCalificacion.belongsTo(models.Administrativo, {
      as: "actualizador",
      foreignKey: "actualizadoPor",
    });
  };

  return TipoCalificacion;
};
