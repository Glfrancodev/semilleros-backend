module.exports = (sequelize, DataTypes) => {
  const TipoCalificacion = sequelize.define(
    'TipoCalificacion',
    {
      idTipoCalificacion: {
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
        type: DataTypes.INTEGER,
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
      tableName: 'TipoCalificacion',
      freezeTableName: true,
      timestamps: false,
    }
  );

  TipoCalificacion.associate = (models) => {
    // FK -> Calificacion
    TipoCalificacion.belongsTo(models.Calificacion, {
      as: 'calificacion',
      foreignKey: { name: 'idCalificacion', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return TipoCalificacion;
};
