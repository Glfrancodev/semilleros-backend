module.exports = (sequelize, DataTypes) => {
  const Tarea = sequelize.define(
    "Tarea",
    {
      idTarea: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fechaLimite: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      fechaActualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      idFeria: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "Tarea",
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Tarea.associate = (models) => {
    // Una Tarea tiene muchas Revisiones
    Tarea.hasMany(models.Revision, {
      as: "revisiones",
      foreignKey: { name: "idTarea", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Una Tarea pertenece a una Feria
    Tarea.belongsTo(models.Feria, {
      as: "feria",
      foreignKey: { name: "idFeria", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  };

  return Tarea;
};
