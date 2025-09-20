module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define(
    'Categoria',
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
    },
    {
      tableName: 'Categoria',
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Categoria.associate = (models) => {
    // Relación con Proyecto (Categoria -> Proyecto)
    Categoria.hasMany(models.Proyecto, {
      as: 'proyectos',
      foreignKey: { name: 'idCategoria', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Categoria;
};
