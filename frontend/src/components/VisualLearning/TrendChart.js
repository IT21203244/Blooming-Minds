import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

// Register required components
ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

const TrendChart = ({ data }) => {
  const labels = data.map((entry) => new Date(entry.date).toLocaleDateString());
  const accuracyData = data.map((entry) => entry.total_score);
  const timeData = data.map((entry) => entry.time_taken);
  const errors = data.map((entry) => entry.wrong_takes);
  const levels = data.map((entry) => entry.level); // Get the level for each entry

  // Define pastel colors for each level
  const getColorForLevel = (level) => {
    switch (level) {
      case "easy":
        return "rgba(255, 182, 193, 0.6)"; // Pastel Pink for Easy
      case "medium":
        return "rgba(173, 216, 230, 0.6)"; // Pastel Blue for Medium
      case "hard":
        return "rgba(144, 238, 144, 0.6)"; // Pastel Green for Hard
      default:
        return "rgba(211, 211, 211, 0.6)"; // Default grey if no level is found
    }
  };

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Accuracy (%)",
        data: accuracyData,
        borderColor: "blue",
        fill: false,
        tension: 0.3, // Smooth curves
      },
      {
        label: "Time Taken (s)",
        data: timeData,
        borderColor: "green",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Errors",
        data: errors,
        backgroundColor: "red",
      },
    ],
  };

  // New Bar Chart Data for Time Taken vs Accuracy with colors based on level
  const timeVsAccuracyData = {
    labels: timeData, // Time taken on the x-axis
    datasets: [
      {
        label: "Accuracy vs Time Taken",
        data: accuracyData, // Accuracy on the y-axis
        backgroundColor: levels.map(getColorForLevel), // Map colors based on level
        borderColor: levels.map((level) => {
          // Optional: set a darker border color for contrast
          switch (level) {
            case "easy":
              return "rgba(255, 105, 180, 1)"; // Darker Pink for Easy
            case "medium":
              return "rgba(70, 130, 180, 1)"; // Darker Blue for Medium
            case "hard":
              return "rgba(0, 128, 0, 1)"; // Darker Green for Hard
            default:
              return "rgba(169, 169, 169, 1)"; // Default grey for unknown level
          }
        }),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="charts">
      <h2>Performance Trends</h2>
      <div className="line-chart">
        <Line data={lineChartData} />
      </div>
      <div className="bar-chart">
        <Bar data={barChartData} />
      </div>

      {/* New Bar Chart for Time Taken vs Accuracy */}
      <div className="time-vs-accuracy-bar-chart">
        <h3>Time Taken vs Accuracy</h3>
        <div className="level-legend">
        <h4>Level Legend:</h4>
        <div className="legend-box" style={{ display: "flex", alignItems: "center" }}>
          <div
            className="legend-color-box"
            style={{
              backgroundColor: "rgba(255, 182, 193, 0.6)",
              width: "20px",
              height: "20px",
              marginRight: "10px",
            }}
          ></div>
          <span>Easy</span>
        </div>
        <div className="legend-box" style={{ display: "flex", alignItems: "center" }}>
          <div
            className="legend-color-box"
            style={{
              backgroundColor: "rgba(173, 216, 230, 0.6)",
              width: "20px",
              height: "20px",
              marginRight: "10px",
            }}
          ></div>
          <span>Medium</span>
        </div>
        <div className="legend-box" style={{ display: "flex", alignItems: "center" }}>
          <div
            className="legend-color-box"
            style={{
              backgroundColor: "rgba(144, 238, 144, 0.6)",
              width: "20px",
              height: "20px",
              marginRight: "10px",
            }}
          ></div>
          <span>Hard</span>
        </div>
      </div>
        <Bar data={timeVsAccuracyData} />
      </div>

      
      
    </div>
  );
};

export default TrendChart;
