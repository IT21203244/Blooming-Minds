import React, { useState } from "react";
import axios from "axios";
import "./FetchColorMatchingReport.css";

const FetchColorMatchingReport = () => {
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState([]);
  const [images, setImages] = useState({
    accuracyVsTime: "",
    avgTimePerLevel: "",
    errorFrequency: "",
  });

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    setInsights([]);
    setImages({
      accuracyVsTime: "",
      avgTimePerLevel: "",
      errorFrequency: "",
    });

    try {
      const params = {
        user_id: userId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const response = await axios.get(
        "http://localhost:5000/visual_learning/color_matching_game/generate_report",
        { params }
      );

      const { insights, accuracy_vs_time_image, avg_time_per_level_image, error_frequency_image } =
        response.data;

      setInsights(insights);
      setImages({
        accuracyVsTime: `http://localhost:5000/${accuracy_vs_time_image}`,
        avgTimePerLevel: `http://localhost:5000/${avg_time_per_level_image}`,
        errorFrequency: `http://localhost:5000/${error_frequency_image}`,
      });
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while fetching the report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h1>Color Matching Game Report</h1>

      <div className="filters">
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={fetchReport}>Generate Report</button>
      </div>

      {loading && <p>Loading report...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && insights.length > 0 && (
        <div className="report-insights">
          <h2>Report Insights</h2>
          <ul>
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>

          <div className="report-images">
            <h3>Visualizations</h3>
            <div>
              <h4>Accuracy Over Time</h4>
              <img src={images.accuracyVsTime} alt="Accuracy Over Time" />
            </div>
            <div>
              <h4>Average Completion Time per Level</h4>
              <img src={images.avgTimePerLevel} alt="Average Completion Time per Level" />
            </div>
            <div>
              <h4>Error Frequency per Level</h4>
              <img src={images.errorFrequency} alt="Error Frequency per Level" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchColorMatchingReport;
