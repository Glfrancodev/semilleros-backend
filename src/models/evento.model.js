module.exports = (sequelize, DataTypes) => {
  const Evento = sequelize.define(
    'Evento',  // Nombre del modelo
    {
      idEvento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      descripcion: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: { notEmpty: true },
      },
      fechaProgramada: {
        type: DataTypes.DATE,
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
      tableName: 'Evento',  // Nombre de la tabla
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  Evento.associate = (models) => {
    // Relación con la tabla 'EstudianteEvento' (Evento -> EstudianteEvento)
    Evento.hasMany(models.EstudianteEvento, {
      as: 'estudiantesEventos',
      foreignKey: { name: 'idEvento', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Evento;
};
