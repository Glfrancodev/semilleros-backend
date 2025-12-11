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

    // FK -> Administrativo (creador)
    Area.belongsTo(models.Administrativo, {
      as: "creador",
      foreignKey: { name: "creadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // FK -> Administrativo (actualizador)
    Area.belongsTo(models.Administrativo, {
      as: "actualizador",
      foreignKey: { name: "actualizadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  };

  return Area;
};
