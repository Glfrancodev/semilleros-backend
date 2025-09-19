module.exports = (sequelize, DataTypes) => {
  const Estudiante = sequelize.define(
    'Estudiante',  // El nombre del modelo sigue siendo 'Estudiante'
    {
      idEstudiante: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      codigoEstudiante: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,  // Código único para cada estudiante
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
      tableName: 'Estudiante',  // Nombre de la tabla en singular, tal como aparece en el diagrama
      freezeTableName: true,
      timestamps: false,  // No gestionamos los timestamps automáticamente
    }
  );

  Estudiante.associate = (models) => {
    // Relación con la tabla 'Usuario' (Estudiante -> Usuario)
    Estudiante.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: { name: 'idUsuario', allowNull: false },  // idUsuario como llave foránea
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con la tabla intermedia 'EstudianteEvento' (Estudiante -> EstudianteEvento)
    Estudiante.hasMany(models.EstudianteEvento, {
      as: 'estudiantesEventos',
      foreignKey: { name: 'idEstudiante', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Estudiante;
};
