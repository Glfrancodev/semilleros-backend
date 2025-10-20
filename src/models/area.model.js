module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define(
    "Area",
    {
      idArea: {
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
      tableName: "Area",
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Area.associate = (models) => {
    // Relación con AreaCategoria (Area -> AreaCategoria)
    Area.hasMany(models.AreaCategoria, {
      as: "areaCategorias",
      foreignKey: { name: "idArea", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  };

  return Area;
};
