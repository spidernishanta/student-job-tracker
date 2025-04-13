require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const jobRoutes = require("./src/routes/jobRoutes");
const authRoutes = require("./src/routes/authRoutes");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const protect = require("./src/middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3001;

// Check for required environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing required environment variables");
  process.exit(1);  // Exit process if a required variable is missing
}

// security middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000", // frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // frontend CORS
app.use(mongoSanitize());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api", protect, jobRoutes); // Protect the job routes

// Health check route (optional)
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Error handling middleware (catch-all for unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// connect to DB
connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
