import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserLettersTable.css";

const UserLettersTable = ({ userId }) => {
  const [letters, setLetters] = useState([]);
  const [letterCounts, setLetterCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/read_write_learning/get_user_letters/${userId}`
        );
        const fetchedLetters = response.data.user_letters;

        // Update letters state
        setLetters(fetchedLetters);

        // Calculate counts of system letters directly
        const counts = fetchedLetters.reduce((acc, letter) => {
          const { system_letter } = letter;
          acc[system_letter] = (acc[system_letter] || 0) + 1;
          return acc;
        }, {});

        // Update letterCounts state
        setLetterCounts(counts);
      } catch (err) {
        console.error("Error fetching letters", err);
      }
    };

    fetchLetters();
  }, [userId]);

  // Navigate to the analysis page when a square is clicked
  const handleAnalysisNavigation = (letter) => {
    navigate(`/analysis/${userId}/${letter}`);
  };

  return (
    <div className="letters-table">
      <h2>User Letters</h2>
      {letters.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Predicted Letter</th>
                <th>System Letter</th>
                <th>Uploaded At</th>
                <th>Accuracy</th>
                <th>Status</th>
                <th>View Image</th>
              </tr>
            </thead>
            <tbody>
              {letters.map((letter, index) => (
                <tr key={index}>
                  <td>{letter.predicted_letter}</td>
                  <td>{letter.system_letter}</td>
                  <td>{letter.uploaded_at}</td>
                  <td>{letter.accuracy.toFixed(2)}%</td>
                  <td>{letter.status}</td>
                  <td>
                    <button>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Letter Generation Counts</h3>
          <div className="letter-squares-container">
            {Object.entries(letterCounts).map(([letter, count]) => (
              <div
                key={letter}
                className="letter-square"
                onClick={() => handleAnalysisNavigation(letter)}
              >
                <span className="letter">{letter}</span>
                <span className="count">{count} times</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No letters found for this user.</p>
      )}
    </div>
  );
};

export default UserLettersTable;
