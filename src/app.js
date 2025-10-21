require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes"); // Lo vamos a definir después
const responseHandler = require("./middleware/responseHandler");

const app = express();

const whitelist = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
app.use(express.json());
app.use(responseHandler); // ✅ Middleware de respuestas estandarizadas
app.use("/api", routes); // ✅

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.error(err.message || "Error interno del servidor", err.status || 500, {
    code: err.code || "INTERNAL_ERROR",
  });
});

module.exports = app;
