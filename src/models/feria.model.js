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
      estado: {
        type: DataTypes.ENUM("Borrador", "Activo", "Finalizado"),
        allowNull: false,
        defaultValue: "Activo",
      },
      ganadores: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
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

    // Relación con Semestre (Feria -> Semestre)
    Feria.hasMany(models.Semestre, {
      as: "semestres",
      foreignKey: { name: "idFeria", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // FK -> TipoCalificacion (nullable)
    Feria.belongsTo(models.TipoCalificacion, {
      as: "tipoCalificacion",
      foreignKey: { name: "idTipoCalificacion", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  };

  return Feria;
};
