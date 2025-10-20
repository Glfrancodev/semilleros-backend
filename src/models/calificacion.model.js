module.exports = (sequelize, DataTypes) => {
  const Calificacion = sequelize.define(
    'Calificacion',
    {
      idCalificacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      puntajeObtenido: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0 },
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
    // FK -> SubCalificacion (1 a 1)
    Calificacion.belongsTo(models.SubCalificacion, {
      as: 'subCalificacion',
      foreignKey: { name: 'idSubCalificacion', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // FK -> DocenteProyecto (1 a 1)
    Calificacion.belongsTo(models.DocenteProyecto, {
      as: 'docenteProyecto',
      foreignKey: { name: 'idDocenteProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Calificacion;
};
