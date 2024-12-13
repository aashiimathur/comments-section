require("dotenv").config({ path: "./.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const commentsRoutes = require("./routes/comments");
const { router: authRoutes } = require("./routes/auth");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (e.g., login HTML page)
app.use(express.static(path.join(__dirname, "public")));

// Default route to serve the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Routes
app.use("/api", commentsRoutes);
app.use("/auth", authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
