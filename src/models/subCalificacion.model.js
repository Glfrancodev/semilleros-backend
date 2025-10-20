module.exports = (sequelize, DataTypes) => {
  const SubCalificacion = sequelize.define(
    'SubCalificacion',
    {
      idSubCalificacion: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      maximoPuntaje: {
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
      tableName: 'SubCalificacion',
      freezeTableName: true,
      timestamps: false,
    }
  );

  SubCalificacion.associate = (models) => {
    // FK -> TipoCalificacion (1 a 1)
    SubCalificacion.belongsTo(models.TipoCalificacion, {
      as: 'tipoCalificacion',
      foreignKey: { name: 'idTipoCalificacion', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación 0 a muchos con Calificacion
    SubCalificacion.hasMany(models.Calificacion, {
      as: 'calificaciones',
      foreignKey: { name: 'idSubCalificacion', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return SubCalificacion;
};
