// server.js
require("dotenv").config();

const http = require("http");
const app = require("./app");
const db = require("./models");
const sequelize = db.sequelize;
const { initializeSocket } = require("./config/socket");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada");

    await sequelize.sync({ alter: true });
    console.log("✅ Tablas sincronizadas");

    const PORT = process.env.PORT || 3000;

    // Crear servidor HTTP
    const server = http.createServer(app);

    // Inicializar Socket.io
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error crítico:", err);
    process.exit(1);
  }
})();
