module.exports = (sequelize, DataTypes) => {
  const Convocatoria = sequelize.define(
    'Convocatoria',
    {
      idConvocatoria: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      gestion: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: { notEmpty: true },
      },
      año: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 2000 },
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
      tableName: 'Convocatoria',
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Convocatoria.associate = (models) => {
    // Relación con Proyecto (Convocatoria -> Proyecto)
    Convocatoria.hasMany(models.Proyecto, {
      as: 'proyectos',
      foreignKey: { name: 'idConvocatoria', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Convocatoria;
};
