// server.js
require('dotenv').config();

const app = require('./app');
const db = require('./models'); // ✅ Esta línea importa todos los modelos
const sequelize = db.sequelize;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada');

    await sequelize.sync({ alter: true }); // ✅ ¡Ahora sí va a sincronizar las tablas!
    console.log('✅ Tablas sincronizadas');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Error crítico:', err);
    process.exit(1);
  }
})();
