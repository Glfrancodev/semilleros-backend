module.exports = (sequelize, DataTypes) => {
  const Semestre = sequelize.define(
    "Semestre",
    {
      idSemestre: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      numero: {
        type: DataTypes.STRING(10),
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
      tableName: "Semestre",
      freezeTableName: true,
      timestamps: false, // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  Semestre.associate = (models) => {
    // Relación con la tabla Materia (Semestre -> Materia)
    Semestre.hasMany(models.Materia, {
      as: "materias",
      foreignKey: { name: "idSemestre", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Relación con la tabla Feria (Semestre -> Feria)
    Semestre.belongsTo(models.Feria, {
      as: "feria",
      foreignKey: { name: "idFeria", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  };

  return Semestre;
};
