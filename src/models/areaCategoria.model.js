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
  };

  return AreaCategoria;
};
