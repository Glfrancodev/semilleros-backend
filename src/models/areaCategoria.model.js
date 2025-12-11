module.exports = (sequelize, DataTypes) => {
  const AreaCategoria = sequelize.define(
    "AreaCategoria",
    {
      idAreaCategoria: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      idArea: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Area",
          key: "idArea",
        },
      },
      idCategoria: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Categoria",
          key: "idCategoria",
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
      // Foreign Keys para auditoría
      creadoPor: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      actualizadoPor: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "AreaCategoria",
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  AreaCategoria.associate = (models) => {
    // Relación con Area (AreaCategoria -> Area)
    AreaCategoria.belongsTo(models.Area, {
      as: "area",
      foreignKey: { name: "idArea", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Relación con Categoria (AreaCategoria -> Categoria)
    AreaCategoria.belongsTo(models.Categoria, {
      as: "categoria",
      foreignKey: { name: "idCategoria", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Relación con Materia (AreaCategoria -> Materia)
    AreaCategoria.hasMany(models.Materia, {
      as: "materias",
      foreignKey: { name: "idAreaCategoria", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // FK -> Administrativo (creador)
    AreaCategoria.belongsTo(models.Administrativo, {
      as: "creador",
      foreignKey: { name: "creadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // FK -> Administrativo (actualizador)
    AreaCategoria.belongsTo(models.Administrativo, {
      as: "actualizador",
      foreignKey: { name: "actualizadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  };

  return AreaCategoria;
};
