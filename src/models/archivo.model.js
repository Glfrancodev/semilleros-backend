module.exports = (sequelize, DataTypes) => {
  const Archivo = sequelize.define(
    'Archivo',
    {
      idArchivo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      formato: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: { notEmpty: true },
      },
      tamano: {
        type: DataTypes.FLOAT, // en MB o KB, según cómo lo gestiones
        allowNull: false,
        validate: { min: 0 },
      },
      url: {
        type: DataTypes.STRING(500),
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
      tableName: 'Archivo',
      freezeTableName: true,
      timestamps: false,
    }
  );

  Archivo.associate = (models) => {
    // FK -> Proyecto
    Archivo.belongsTo(models.Proyecto, {
      as: 'proyecto',
      foreignKey: { name: 'idProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Archivo;
};
