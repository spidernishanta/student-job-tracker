const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const logger = require("../utils/logger");

const BASE_URL = process.env.FRONTEND_BASE_URL;

// Register new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn("Registration failed - user already exists", { email });
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info("User registered", {
      event: "signup",
      userId: newUser._id,
      email,
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    logger.error("Registration error", {
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login attempt - user not found", { email });
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login attempt - invalid credentials", { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info("User logged in", {
      event: "login",
      userId: user._id,
      email,
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    logger.error("Login error", {
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get authenticated user
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User ID not found" });
    }

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      logger.warn("Forgot password - missing email");
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Forgot password - user not found", { email });
      return res.status(404).json({ message: "No user found with that email" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${BASE_URL}/reset-password/${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}" target="_blank">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    logger.info("Password reset requested", {
      event: "password_reset_request",
      userId: user._id,
      email,
    });

    await sendEmail(user.email, "Password Reset", html);
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    logger.error("Forgot password error", {
      error: err.message,
      stack: err.stack,
    });
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    logger.info("Password reset successful", {
      event: "password_reset",
      userId: decoded.id,
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    logger.warn("Password reset failed - invalid token", {
      error: err.message,
    });
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};
