module.exports = (sequelize, DataTypes) => {
  const Proyecto = sequelize.define(
    'Proyecto',
    {
      idProyecto: {
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
        allowNull: false,
        validate: { notEmpty: true },
      },
      contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      estaAprobado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      esFinal: {
        type: DataTypes.BOOLEAN,
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
      tableName: 'Proyecto',
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Proyecto.associate = (models) => {
    // FK -> Categoria
    Proyecto.belongsTo(models.Categoria, {
      as: 'categoria',
      foreignKey: { name: 'idCategoria', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // FK -> GrupoMateria
    Proyecto.belongsTo(models.GrupoMateria, {
      as: 'grupoMateria',
      foreignKey: { name: 'idGrupoMateria', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // FK -> Convocatoria
    Proyecto.belongsTo(models.Convocatoria, {
      as: 'convocatoria',
      foreignKey: { name: 'idConvocatoria', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con EstudianteProyecto
    Proyecto.hasMany(models.EstudianteProyecto, {
      as: 'estudiantesProyecto',
      foreignKey: { name: 'idProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con Archivo
    Proyecto.hasMany(models.Archivo, {
      as: 'archivos',
      foreignKey: { name: 'idProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Relación con Revision
    Proyecto.hasMany(models.Revision, {
      as: 'revisiones',
      foreignKey: { name: 'idProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    // Relación con DocenteProyecto
    Proyecto.hasMany(models.DocenteProyecto, {
    as: 'docentesProyecto',
    foreignKey: { name: 'idProyecto', allowNull: false },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    });
  };

  return Proyecto;
};
