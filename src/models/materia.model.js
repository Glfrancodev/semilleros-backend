module.exports = (sequelize, DataTypes) => {
  const Materia = sequelize.define(
    "Materia",
    {
      idMateria: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sigla: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: { notEmpty: true },
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      idAreaCategoria: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AreaCategoria",
          key: "idAreaCategoria",
        },
      },
      idSemestre: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Semestre",
          key: "idSemestre",
        },
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
      tableName: "Materia",
      freezeTableName: true,
      timestamps: false, // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  Materia.associate = (models) => {
    // Relación con AreaCategoria (Materia -> AreaCategoria)
    Materia.belongsTo(models.AreaCategoria, {
      as: "areaCategoria",
      foreignKey: { name: "idAreaCategoria", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Relación con la tabla Semestre (Materia -> Semestre)
    Materia.belongsTo(models.Semestre, {
      as: "semestre",
      foreignKey: { name: "idSemestre", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Relación con la tabla GrupoMateria (Materia -> GrupoMateria)
    Materia.hasMany(models.GrupoMateria, {
      as: "grupoMaterias",
      foreignKey: { name: "idMateria", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Auditoría
    Materia.belongsTo(models.Administrativo, {
      as: "creador",
      foreignKey: "creadoPor",
    });

    Materia.belongsTo(models.Administrativo, {
      as: "actualizador",
      foreignKey: "actualizadoPor",
    });
  };

  return Materia;
};
