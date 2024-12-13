import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("All fields are required!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      const { token, username, id } = response.data;

      // Store token and username in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", id);

      // Update parent state with current user data
      setCurrentUser({ token, username, id });

      // Redirect to comments page
      navigate("/comments");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Login failed. Please try again.";
      setMessage(errorMessage);
      console.error("Login failed:", error);
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
          Login
        </Typography>
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
        <Button variant="contained" fullWidth onClick={handleLogin}>
          Login
        </Button>
        {message && (
          <Typography sx={{ marginTop: 2, color: "red" }}>{message}</Typography>
        )}
        <Button
          variant="text"
          sx={{ marginTop: 2 }}
          onClick={() => navigate("/register")}
        >
          Not a user? Register here
        </Button>
      </Box>
    </Box>
  );
};

export default Login;