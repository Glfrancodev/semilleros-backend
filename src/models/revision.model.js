module.exports = (sequelize, DataTypes) => {
  const Revision = sequelize.define(
    "Revision",
    {
      idRevision: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      puntaje: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0 },
      },
      comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      revisado: {
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
      tableName: "Revision",
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Revision.associate = (models) => {
    // FK -> Proyecto (1 a 1)
    Revision.belongsTo(models.Proyecto, {
      as: "proyecto",
      foreignKey: { name: "idProyecto", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // No eliminar el proyecto si se elimina una revisión
    });

    // FK -> Tarea (1 a 1)
    Revision.belongsTo(models.Tarea, {
      as: "tarea",
      foreignKey: { name: "idTarea", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE", // Si se elimina la tarea, se eliminan sus revisiones
    });
  };

  return Revision;
};
