import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import './LetterAnalysisPage.css';

const LetterAnalysisPage = () => {
  const { userId, letter } = useParams();
  const [letterDetails, setLetterDetails] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchLetterDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/read_write_learning/get_user_letter_details/${userId}/${letter}`
        );

        // Check if the response is an array or an object and set accordingly
        if (Array.isArray(response.data.letter_details)) {
          setLetterDetails(response.data.letter_details);
        } else if (response.data.letter_details) {
          setLetterDetails([response.data.letter_details]); // Wrap in array if it's not an array
        }

        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        console.error("Error fetching letter details", err);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchLetterDetails();
  }, [userId, letter]);

  if (loading) {
    return <p>Loading letter details...</p>; // Loading state handling
  }

  if (letterDetails.length === 0) {
    return <p>No attempts found for this letter.</p>; // Handle case where no data is returned
  }

  // Render all attempts
  return (
    <div className="analysis-page">
      <h2>Letter Analysis: {letter}</h2>

      {letterDetails.map((attempt, index) => (
        <div className="analysis-card" key={index}>
          <h3>Attempt {index + 1} Details</h3>
          <div className="card-content">
            <div className="letter-info">
              <p>
                <strong>System Letter:</strong> {attempt.system_letter}
              </p>
              <p>
                <strong>Predicted Letter:</strong> {attempt.predicted_letter}
              </p>
              <p>
                <strong>Accuracy:</strong> {attempt.accuracy}%
              </p>
              <p>
                <strong>Status:</strong> {attempt.status}
              </p>
            </div>
            
            <div className="accuracy-chart">
              <Pie
                data={{
                  labels: ["Correct", "Incorrect"],
                  datasets: [
                    {
                      data: [
                        attempt.accuracy,
                        100 - attempt.accuracy,
                      ],
                      backgroundColor: ["#4caf50", "#f44336"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LetterAnalysisPage;
