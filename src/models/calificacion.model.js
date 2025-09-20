module.exports = (sequelize, DataTypes) => {
  const Calificacion = sequelize.define(
    'Calificacion',
    {
      idCalificacion: {
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
      tableName: 'Calificacion',
      freezeTableName: true,
      timestamps: false,
    }
  );

  Calificacion.associate = (models) => {
    // Relación con TipoCalificacion
    Calificacion.hasMany(models.TipoCalificacion, {
      as: 'tiposCalificacion',
      foreignKey: { name: 'idCalificacion', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con DocenteProyecto
    Calificacion.hasMany(models.DocenteProyecto, {
      as: 'docentesProyecto',
      foreignKey: { name: 'idCalificacion', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Calificacion;
};
