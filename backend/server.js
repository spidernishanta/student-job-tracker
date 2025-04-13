require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const jobRoutes = require("./src/routes/jobRoutes");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const app = express();
const PORT = process.env.PORT || 3001;

//security middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000", //frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // frontend CORS
app.use(mongoSanitize());
app.use(express.json());

// routes
app.use("/api", jobRoutes);

// connect to DB
connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
