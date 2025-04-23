const winston = require("winston");
require("winston-mongodb");
const mongoose = require("mongoose");

const isProduction = process.env.NODE_ENV === "production";

const maskSensitiveData = winston.format((info) => {
  if (isProduction && info.email) {
    info.email = "***@***.***"; // Mask only in production
  }
  return info;
});

const mongoDbTransport = new winston.transports.MongoDB({
  db: mongoose.connection,
  collection: "logs",
  level: "info",
  options: { useUnifiedTopology: true },
});

const logger = winston.createLogger({
  format: winston.format.combine(
    maskSensitiveData(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ level: "debug" }),
    mongoDbTransport,
  ],
});

module.exports = logger;
