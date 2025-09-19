module.exports = (sequelize, DataTypes) => {
  const Materia = sequelize.define(
    'Materia',
    {
      idMateria: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sigla: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: { notEmpty: true },
      },
      nombre: {
        type: DataTypes.STRING(255),
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
      tableName: 'Materia',
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  Materia.associate = (models) => {
    // Relación con la tabla Semestre (Materia -> Semestre)
    Materia.belongsTo(models.Semestre, {
      as: 'semestre',
      foreignKey: { name: 'idSemestre', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con la tabla GrupoMateria (Materia -> GrupoMateria)
    Materia.hasMany(models.GrupoMateria, {
      as: 'grupoMaterias',
      foreignKey: { name: 'idMateria', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Materia;
};
