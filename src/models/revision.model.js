module.exports = (sequelize, DataTypes) => {
  const Revision = sequelize.define(
    'Revision',
    {
      idRevision: {
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
      fechaLimite: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      contenidoEnviado: {
        type: DataTypes.TEXT,
        allowNull: true, // puede estar vacío al principio
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
      tableName: 'Revision',
      freezeTableName: true,
      timestamps: false, // fechas gestionadas manualmente
    }
  );

  Revision.associate = (models) => {
    // FK -> Proyecto
    Revision.belongsTo(models.Proyecto, {
      as: 'proyecto',
      foreignKey: { name: 'idProyecto', allowNull: false },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Revision;
};
