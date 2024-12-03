import React from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/AdminHome.css";

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home-container">
      <h1 className="admin-home-title">Admin Dashboard</h1>
      <div className="card-container">
        <div
          className="admin-card"
          onClick={() => navigate("/InsertLesson")}
        >
          <h2>Add Audio Book</h2>
          <p>Create Nice Audio Bokks!</p>
        </div>
        <div
          className="admin-card"
          onClick={() => navigate("/InsertAudioGame")}
        >
          <h2>Add Audio Game</h2>
          <p>You can make Audio Games related to the AudioBook</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
