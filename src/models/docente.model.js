module.exports = (sequelize, DataTypes) => {
  const Docente = sequelize.define(
    'Docente',
    {
      idDocente: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      codigoDocente: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
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
      // Foreign Key to Usuario
      idUsuario: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'Docente',
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  Docente.associate = (models) => {
    // Relación con la tabla Usuario (Docente -> Usuario)
    Docente.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: { name: 'idUsuario', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con la tabla GrupoMateria (Docente -> GrupoMateria)
    // Aquí se asume que cada Docente puede estar asignado a varios Grupos
    Docente.hasMany(models.GrupoMateria, {
      as: 'grupoMaterias',
      foreignKey: { name: 'idDocente', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Docente;
};
