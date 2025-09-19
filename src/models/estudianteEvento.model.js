module.exports = (sequelize, DataTypes) => {
  const EstudianteEvento = sequelize.define(
    'EstudianteEvento',  // Nombre del modelo
    {
      idEstudianteEvento: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,  // Fecha de creación automática
      },
      fechaActualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,  // Fecha de actualización automática
      },
    },
    {
      tableName: 'EstudianteEvento',  // Nombre de la tabla
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  EstudianteEvento.associate = (models) => {
    // Relación con la tabla 'Estudiante' (EstudianteEvento -> Estudiante)
    EstudianteEvento.belongsTo(models.Estudiante, {
      as: 'estudiante',
      foreignKey: { name: 'idEstudiante', allowNull: false },  // idEstudiante como llave foránea
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con la tabla 'Evento' (EstudianteEvento -> Evento)
    EstudianteEvento.belongsTo(models.Evento, {
      as: 'evento',
      foreignKey: { name: 'idEvento', allowNull: false },  // idEvento como llave foránea
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return EstudianteEvento;
};
