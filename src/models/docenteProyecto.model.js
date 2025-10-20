module.exports = (sequelize, DataTypes) => {
  const DocenteProyecto = sequelize.define(
    'DocenteProyecto',
    {
      idDocenteProyecto: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      esTutor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
      tableName: 'DocenteProyecto',
      freezeTableName: true,
      timestamps: false,
    }
  );

  DocenteProyecto.associate = (models) => {
    // FK -> Docente
    DocenteProyecto.belongsTo(models.Docente, {
      as: 'docente',
      foreignKey: { name: 'idDocente', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // FK -> Proyecto
    DocenteProyecto.belongsTo(models.Proyecto, {
      as: 'proyecto',
      foreignKey: { name: 'idProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación 0 a muchos con Calificacion
    DocenteProyecto.hasMany(models.Calificacion, {
      as: 'calificaciones',
      foreignKey: { name: 'idDocenteProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return DocenteProyecto;
};
