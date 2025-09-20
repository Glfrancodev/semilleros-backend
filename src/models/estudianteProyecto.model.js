module.exports = (sequelize, DataTypes) => {
  const EstudianteProyecto = sequelize.define(
    'EstudianteProyecto',
    {
      idEstudianteProyecto: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      esLider: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: 'EstudianteProyecto',
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  EstudianteProyecto.associate = (models) => {
    // FK -> Estudiante
    EstudianteProyecto.belongsTo(models.Estudiante, {
      as: 'estudiante',
      foreignKey: { name: 'idEstudiante', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // FK -> Proyecto
    EstudianteProyecto.belongsTo(models.Proyecto, {
      as: 'proyecto',
      foreignKey: { name: 'idProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return EstudianteProyecto;
};
