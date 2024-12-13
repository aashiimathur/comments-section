import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    // Field validation
    if (
      !username ||
      username.length < 3 ||
      !email.match(/^\S+@\S+\.\S+$/) ||
      !password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    ) {
      setMessage(
        "Username must be at least 3 characters, email valid, and password at least 8 characters long with numbers."
      );
      return;
    }

    try {
      await axios.post("http://localhost:5000/auth/register", {
        username,
        email,
        password,
      });
      setMessage("Registration successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      setMessage("Registration failed. Please try again.");
      console.error("Registration error:", error);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: "100%",
          padding: 4,
          backgroundColor: "white",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: 4 }}>
          Register
        </Typography>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <Button variant="contained" fullWidth onClick={handleRegister}>
          Register
        </Button>
        {message && (
          <Typography sx={{ marginTop: 2, color: "red" }}>{message}</Typography>
        )}
        <Button
          variant="text"
          sx={{ marginTop: 2 }}
          onClick={() => navigate("/login")}
        >
          Already have an account? Login here
        </Button>
      </Box>
    </Box>
  );
};

export default Register;