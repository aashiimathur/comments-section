import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Comments from "./components/Comments";
import Register from "./components/Register";
import Login from "./components/Login";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  typography: { fontFamily: "Arial, sans-serif" },
});

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Check for stored token on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId"); 

    if (token && username && userId) {
      setCurrentUser({ token, username, id: parseInt(userId) });
    }
  }, []);


  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div style={{ fontFamily: "Arial, sans-serif", marginTop: "20px" }}>
          <h1 style={{ textAlign: "center", color: "#333" }}>Comments Section</h1>
          <Routes>
            {/* Redirect '/' to '/login' by default */}
            <Route
              path="/"
              element={currentUser ? <Navigate to="/comments" /> : <Navigate to="/login" />}
            />
            {/* Login Route */}
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
            {/* Register Route */}
            <Route path="/register" element={<Register />} />
            {/* Comments Route */}
            <Route
              path="/comments"
              element={
                currentUser ? (
                  <Comments currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;