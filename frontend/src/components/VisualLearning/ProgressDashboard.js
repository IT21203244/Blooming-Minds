import React, { useState, useEffect } from "react";
import axios from "axios";
import TrendChart from "./TrendChart";
import Report from "./Report";
import './ProgressDashboard.css'

const ProgressDashboard = () => {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/visual_learning/color_matching_game?user_id=${userId}`
      );
      setData(response.data.results);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch data.");
    }
  };

  const handleSearch = () => {
    if (userId.trim()) {
      fetchData();
    } else {
      setError("Please enter a valid User ID.");
    }
  };

  return (
    <div className="progress-dashboard">
      <h1>Progress Dashboard</h1>
      <div className="search-bar">
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
          />
        </label>
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p className="error">{error}</p>}
      {data.length > 0 ? (
        <>
          <TrendChart data={data} />
          <Report data={data} />
        </>
      ) : (
        <p>No data available. Search for a user to view progress.</p>
      )}
    </div>
  );
};

export default ProgressDashboard;
