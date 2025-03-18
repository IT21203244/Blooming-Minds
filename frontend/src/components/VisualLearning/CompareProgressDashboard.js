import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import './CompareProgressDashboard.css';

// Register the necessary ChartJS components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const CompareProgressDashboard = () => {
  const [progressData, setProgressData] = useState(null);
  const [firstResults, setFirstResults] = useState(null); // State for first results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert("User is not authenticated. Please log in.");
          return;
        }

        // Fetch progress data
        const progressResponse = await axios.get(
          'http://localhost:5000/visual_learning/compare_progress',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProgressData(progressResponse.data);

        // Fetch first results for each level
        const firstResultsResponse = await axios.get(
          'http://localhost:5000/visual_learning/color_matching_game/first_result',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFirstResults(firstResultsResponse.data.results); // Update state with first results
      } catch (err) {
        setError('Error fetching data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const renderComparisonData = () => {
    if (!progressData) {
      return <p>No progress data to compare yet.</p>;
    }

    return Object.keys(progressData).map((level, index) => {
      const levelData = progressData[level];

      return (
        <div key={index} className="comparison-level">
          <h2>{level.charAt(0).toUpperCase() + level.slice(1)} Level</h2>
          {levelData.map((comparison, idx) => {
            const { first_result, current_result, accuracy_diff, time_efficiency_diff, reward_diff } = comparison;
            return (
              <div key={idx} className="comparison-pair">
                <div className="chart-container">
                  <h4>First Result</h4>
                  <Pie data={generateChartData(first_result)} />
                  <div className="result-values">
                    <p>Accuracy: {first_result.accuracy?.toFixed(2) || 'N/A'}</p>
                    <p>Time Efficiency: {first_result.time_efficiency?.toFixed(2) || 'N/A'}</p>
                    <p>Reward: {first_result.reward?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>

                <div className="chart-container">
                  <h4>Current Result</h4>
                  <Pie data={generateChartData(current_result)} />
                  <div className="result-values">
                    <p>Accuracy: {current_result.accuracy?.toFixed(2) || 'N/A'}</p>
                    <p>Time Efficiency: {current_result.time_efficiency?.toFixed(2) || 'N/A'}</p>
                    <p>Reward: {current_result.reward?.toFixed(2) || 'N/A'}</p>
                    <p>Accuracy Difference: {accuracy_diff.toFixed(2)}</p>
                    <p>Time Efficiency Difference: {time_efficiency_diff.toFixed(2)}</p>
                    <p>Reward Difference: {reward_diff.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  const generateChartData = (result) => {
    return {
      labels: ['Accuracy', 'Time Efficiency', 'Reward'],
      datasets: [
        {
          data: [result.accuracy, result.time_efficiency, result.reward],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverOffset: 4,
        },
      ],
    };
  };

  const renderFirstResults = () => {
    if (!firstResults) {
      return <p>No first results found.</p>;
    }

    return Object.keys(firstResults).map((level) => {
      const result = firstResults[level];
      const chartData = {
        labels: ['Accuracy', 'Time Efficiency', 'Reward'],
        datasets: [
          {
            data: [result.accuracy, result.time_efficiency, result.reward],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            hoverOffset: 4,
          },
        ],
      };

      return (
        <div key={level} className="level-card">
          <h3>{level.charAt(0).toUpperCase() + level.slice(1)} First Results</h3>
          <Pie data={chartData} />
          <div className="result-values">
            <p>Accuracy: {result.accuracy.toFixed(2)}</p>
            <p>Time Efficiency: {result.time_efficiency.toFixed(2)}</p>
            <p>Reward: {result.reward.toFixed(2)}</p>
          </div>
        </div>
      );
    });
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="compare-progress-dashboard">
      <h1>Compare Learning Progress</h1>

      {loading && <p>Loading data...</p>}

      {/* Only render first results and comparison data if no error */}
      <div className="first-results">
        {renderFirstResults()}
      </div>

      <div className="comparison-results">
        {renderComparisonData()}
      </div>
    </div>
  );
};

export default CompareProgressDashboard;
