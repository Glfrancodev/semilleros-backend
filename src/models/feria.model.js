module.exports = (sequelize, DataTypes) => {
  const Feria = sequelize.define(
    "Feria",
    {
      idFeria: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      semestre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      año: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 2000 },
      },
      estaActivo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "Feria",
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Feria.associate = (models) => {
    // Relación con Tarea (Feria -> Tarea)
    Feria.hasMany(models.Tarea, {
      as: "tareas",
      foreignKey: { name: "idFeria", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  };

  return Feria;
};
