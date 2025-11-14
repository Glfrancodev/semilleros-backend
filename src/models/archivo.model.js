module.exports = (sequelize, DataTypes) => {
  const Archivo = sequelize.define(
    "Archivo",
    {
      idArchivo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      formato: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: { notEmpty: true },
      },
      tamano: {
        type: DataTypes.FLOAT, // en MB o KB, según cómo lo gestiones
        allowNull: false,
        validate: { min: 0 },
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: { notEmpty: true },
      },
      tipo: {
        type: DataTypes.ENUM(
          "logo",
          "banner",
          "triptico",
          "contenido",
          "perfil"
        ),
        allowNull: false,
        defaultValue: "contenido",
        validate: {
          isIn: [["logo", "banner", "triptico", "contenido", "perfil"]],
        },
      },
      // Foreign Keys - Declaradas explícitamente para permitir NULL
      idProyecto: {
        type: DataTypes.UUID,
        allowNull: true, // Puede ser null para fotos de perfil
      },
      idRevision: {
        type: DataTypes.UUID,
        allowNull: true, // Puede ser null si no está asociado a una revisión
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
      tableName: "Archivo",
      freezeTableName: true,
      timestamps: false,
    }
  );

  Archivo.associate = (models) => {
    // FK -> Proyecto (opcional, ya que fotos de perfil no tienen proyecto)
    Archivo.belongsTo(models.Proyecto, {
      as: "proyecto",
      foreignKey: "idProyecto",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // FK -> Revision (opcional)
    Archivo.belongsTo(models.Revision, {
      as: "revision",
      foreignKey: "idRevision",
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  };

  return Archivo;
};
