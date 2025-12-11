const { sequelize } = require('./src/models');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Iniciando migración de Materia...');

    // 1. Ampliar longitud de columna sigla
    try {
      await sequelize.query('ALTER TABLE "Materia" ALTER COLUMN "sigla" TYPE VARCHAR(50);');
      console.log('Columna sigla actualizada a VARCHAR(50).');
    } catch (error) {
      console.log('Nota: La columna sigla podría ya estar actualizada o hubo un error menor:', error.message);
    }

    // 2. Agregar columnas de auditoría si no existen
    try {
      // Leemos el archivo SQL
      const sqlPath = path.join(__dirname, 'migrations', 'add-audit-trail-to-materia.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Ejecutamos el SQL
      await sequelize.query(sql);
      console.log('Columnas de auditoría agregadas exitosamente.');
    } catch (error) {
      if (error.original && error.original.code === '42701') {
        console.log('Las columnas de auditoría ya existen.');
      } else {
        console.error('Error al agregar columnas de auditoría:', error);
      }
    }

    console.log('Migración completada.');
    process.exit(0);
  } catch (error) {
    console.error('Error fatal durante la migración:', error);
    process.exit(1);
  }
}

runMigration();
