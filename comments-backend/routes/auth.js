const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

// Debug log to confirm the secret key is loaded
if (!process.env.SECRET_KEY) {
  console.warn("WARNING: SECRET_KEY is not defined in .env. Using default_secret_key.");
}
console.log("Loaded Secret Key:", SECRET_KEY);

// Middleware for Token Authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ error: "Token required" });
  }

  try {
    console.log("Verifying Token:", token);
    console.log("Using Secret Key:", SECRET_KEY);
    req.user = jwt.verify(token, SECRET_KEY); // Verify token
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).send({ error: "Invalid or expired token" });
  }
};

// Register a user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (id, username, email, password_hash) VALUES (UUID(), ?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).send({ message: "Registration successful!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const isEmailDuplicate = error.sqlMessage.includes("users.email");
      const isUsernameDuplicate = error.sqlMessage.includes("users.username");

      const errorMessage = isEmailDuplicate
        ? "An account with this email already exists."
        : isUsernameDuplicate
        ? "This username is already taken."
        : "Registration failed. Please try again.";

      res.status(400).send({ error: errorMessage });
    } else {
      console.error("Registration failed:", error.message);
      res.status(500).send({ error: "Registration failed. Please try again." });
    }
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).send({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username }, // Include user ID in token payload
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("Generated Token:", token);

    // Return id, token, and username to frontend
    res.send({ token, username: user.username, id: user.id }); 
  } catch (error) {
    console.error("Login failed:", error.message);
    res.status(500).send({ error: "Login failed. Please try again." });
  }
});

// Export routes and middleware
module.exports = { router, authenticate };