module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define(
    "Categoria",
    {
      idCategoria: {
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
      tableName: "Categoria",
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Categoria.associate = (models) => {
    // Relación con AreaCategoria (Categoria -> AreaCategoria)
    Categoria.hasMany(models.AreaCategoria, {
      as: "areaCategorias",
      foreignKey: { name: "idCategoria", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // FK -> Administrativo (creador)
    Categoria.belongsTo(models.Administrativo, {
      as: "creador",
      foreignKey: { name: "creadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // FK -> Administrativo (actualizador)
    Categoria.belongsTo(models.Administrativo, {
      as: "actualizador",
      foreignKey: { name: "actualizadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  };

  return Categoria;
};
