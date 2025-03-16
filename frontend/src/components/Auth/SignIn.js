// SignIn.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './SignIn.css';  // Add CSS for styling
import Children1 from "./img/children2.png"

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    const response = await fetch("http://localhost:5000/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Save token to localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.username);
      alert('Login Successfully')
      navigate("/home"); // Redirect to the home page after login
    } else {
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h2 className="signin-heading">Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSignIn} className="signin-form">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="signin-btn">Sign In</button>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
      <div className="image-container">
        <img
          src={Children1} 
          alt="Children1"
        />
      </div>
    </div>
  );
};

export default SignIn;
