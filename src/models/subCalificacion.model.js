module.exports = (sequelize, DataTypes) => {
  const SubCalificacion = sequelize.define(
    "SubCalificacion",
    {
      idSubCalificacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      maximoPuntaje: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0 },
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
      tableName: "SubCalificacion",
      freezeTableName: true,
      timestamps: false,
    }
  );

  SubCalificacion.associate = (models) => {
    // FK -> TipoCalificacion (1 a 1)
    SubCalificacion.belongsTo(models.TipoCalificacion, {
      as: "tipoCalificacion",
      foreignKey: { name: "idTipoCalificacion", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Relación 1 a muchos con Calificacion
    SubCalificacion.hasMany(models.Calificacion, {
      as: "calificaciones",
      foreignKey: { name: "idSubCalificacion", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Auditoría
    SubCalificacion.belongsTo(models.Administrativo, {
      as: "creador",
      foreignKey: "creadoPor",
    });

    SubCalificacion.belongsTo(models.Administrativo, {
      as: "actualizador",
      foreignKey: "actualizadoPor",
    });

  };

  return SubCalificacion;
};
