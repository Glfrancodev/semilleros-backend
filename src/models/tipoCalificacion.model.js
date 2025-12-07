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
  };

  return TipoCalificacion;
};
