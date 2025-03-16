// SignUp.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './SignUp.css';  // Add CSS for styling
import Children from "./img/children.png"

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    const response = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Account Created Successfully')
      navigate("/"); // Redirect to Sign In page after successful registration
    } else {
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-heading">Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSignUp} className="signup-form">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>
        <p className="signin-link">
          Already have an account? <a href="/">Sign In</a>
        </p>
      </div>
      <img
        src={Children} 
        alt="Children"
        className="bottom-image"
      />
    </div>
  );
  
  
};

export default SignUp;
