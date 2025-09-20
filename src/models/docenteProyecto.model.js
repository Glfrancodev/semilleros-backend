module.exports = (sequelize, DataTypes) => {
  const DocenteProyecto = sequelize.define(
    'DocenteProyecto',
    {
      idDocenteProyecto: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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

    // FK -> Calificacion
    DocenteProyecto.belongsTo(models.Calificacion, {
      as: 'calificacion',
      foreignKey: { name: 'idCalificacion', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return DocenteProyecto;
};
