module.exports = (sequelize, DataTypes) => {
  const Administrativo = sequelize.define(
    "Administrativo",
    {
      idAdministrativo: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      codigoAdministrativo: {
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
      tableName: "Administrativo",
      freezeTableName: true,
      timestamps: false, // No gestionamos los timestamps automáticamente
    }
  );

  // Asociaciones
  Administrativo.associate = (models) => {
    // Relación con la tabla Usuario (Administrativo -> Usuario)
    Administrativo.belongsTo(models.Usuario, {
      as: "usuario",
      foreignKey: { name: "idUsuario", allowNull: false },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Relación con Ferias creadas (Administrativo -> Feria)
    Administrativo.hasMany(models.Feria, {
      as: "feriasCreadas",
      foreignKey: { name: "creadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Relación con Ferias actualizadas (Administrativo -> Feria)
    Administrativo.hasMany(models.Feria, {
      as: "feriasActualizadas",
      foreignKey: { name: "actualizadoPor", allowNull: true },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // --- AREA ---
    Administrativo.hasMany(models.Area, {
      as: "areasCreadas",
      foreignKey: "creadoPor",
    });
    Administrativo.hasMany(models.Area, {
      as: "areasActualizadas",
      foreignKey: "actualizadoPor",
    });

    // --- CATEGORIA ---
    Administrativo.hasMany(models.Categoria, {
      as: "categoriasCreadas",
      foreignKey: "creadoPor",
    });
    Administrativo.hasMany(models.Categoria, {
      as: "categoriasActualizadas",
      foreignKey: "actualizadoPor",
    });

    // --- AREA CATEGORIA ---
    Administrativo.hasMany(models.AreaCategoria, {
      as: "areaCategoriasCreadas",
      foreignKey: "creadoPor",
    });
    Administrativo.hasMany(models.AreaCategoria, {
      as: "areaCategoriasActualizadas",
      foreignKey: "actualizadoPor",
    });
  };

  return Administrativo;
};
