import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';

const LetterProgressPage = ({ userId, match }) => {
  const [progressData, setProgressData] = useState(null);
  const letter = match.params.letter;  // Extract letter from URL

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/read_write_learning/get_letter_progress/${userId}/${letter}`);
        setProgressData(response.data);
      } catch (err) {
        console.error("Error fetching progress data", err);
      }
    };

    fetchProgressData();
  }, [userId, letter]);

  if (!progressData) return <p>Loading progress...</p>;

  // Prepare chart data for accuracy over time (line chart)
  const lineChartData = {
    labels: progressData.timestamps,
    datasets: [
      {
        label: 'Accuracy Over Time',
        data: progressData.accuracies,
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
      },
    ],
  };

  // Prepare chart data for accuracy status (pie chart)
  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [
          progressData.statuses.filter(status => status === 'correct').length,
          progressData.statuses.filter(status => status === 'incorrect').length
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <div>
      <h2>Progress for Letter: {letter}</h2>
      <h3>Total Attempts: {progressData.total_attempts}</h3>
      
      <div>
        <h4>Accuracy Over Time</h4>
        <Line data={lineChartData} />
      </div>

      <div>
        <h4>Accuracy Status</h4>
        <Pie data={pieChartData} />
      </div>
    </div>
  );
};

export default LetterProgressPage;
