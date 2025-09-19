module.exports = (sequelize, DataTypes) => {
  const Grupo = sequelize.define(
    'Grupo',
    {
      idGrupo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sigla: {
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
      tableName: 'Grupo',
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  Grupo.associate = (models) => {
    // Relación con la tabla GrupoMateria (Grupo -> GrupoMateria)
    Grupo.hasMany(models.GrupoMateria, {
      as: 'grupoMaterias',
      foreignKey: { name: 'idGrupo', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Grupo;
};
