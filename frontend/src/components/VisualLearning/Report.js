import React from "react";

const Report = ({ data }) => {
  const avgAccuracy =
    data.reduce((sum, entry) => sum + entry.total_score, 0) / data.length || 0;
  const avgTime =
    data.reduce((sum, entry) => sum + entry.time_taken, 0) / data.length || 0;
  const avgErrors =
    data.reduce((sum, entry) => sum + entry.wrong_takes, 0) / data.length || 0;

  const insights = [];
  if (avgAccuracy > 80) insights.push("Great overall accuracy!");
  if (avgErrors > 5) insights.push("Frequent errors indicate challenges.");
  if (avgTime < 10) insights.push("Good efficiency in completion time.");

  return (
    <div className="report">
      <h2>Progress Report</h2>
      <p>Average Accuracy: {avgAccuracy.toFixed(2)}%</p>
      <p>Average Time Taken: {avgTime.toFixed(2)} seconds</p>
      <p>Average Errors: {avgErrors.toFixed(2)}</p>
      <h3>Insights</h3>
      <ul>
        {insights.length > 0 ? (
          insights.map((insight, index) => <li key={index}>{insight}</li>)
        ) : (
          <li>No significant insights available.</li>
        )}
      </ul>
    </div>
  );
};

export default Report;
