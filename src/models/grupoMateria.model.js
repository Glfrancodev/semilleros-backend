module.exports = (sequelize, DataTypes) => {
  const GrupoMateria = sequelize.define(
    'GrupoMateria',
    {
      idGrupoMateria: {
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
      // Foreign Key to Docente
      idDocente: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'GrupoMateria',
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  GrupoMateria.associate = (models) => {
    // Relación con la tabla Grupo (GrupoMateria -> Grupo)
    GrupoMateria.belongsTo(models.Grupo, {
      as: 'grupo',
      foreignKey: { name: 'idGrupo', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con la tabla Materia (GrupoMateria -> Materia)
    GrupoMateria.belongsTo(models.Materia, {
      as: 'materia',
      foreignKey: { name: 'idMateria', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con la tabla Docente (GrupoMateria -> Docente)
    GrupoMateria.belongsTo(models.Docente, {
      as: 'docente',
      foreignKey: { name: 'idDocente', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return GrupoMateria;
};
