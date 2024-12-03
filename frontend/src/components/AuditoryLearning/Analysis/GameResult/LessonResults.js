import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS/GameResults.css";

const GameResults = () => {
  const [gameResults, setGameResults] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [userSessions, setUserSessions] = useState({});
  const [totalSpentTime, setTotalSpentTime] = useState(0);

  useEffect(() => {
    const fetchGameResults = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_audiogame_results"
        );
        setGameResults(response.data.audiogame_results);
        setFilteredResults(response.data.audiogame_results);
        calculateSummaries(response.data.audiogame_results);
      } catch (err) {
        setError("An error occurred while fetching the game results.");
      }
    };

    fetchGameResults();
  }, []);

  const handleUserIdChange = (e) => {
    const id = e.target.value;
    setUserId(id);

    if (id) {
      const filtered = gameResults.filter(
        (result) => result.user_id === id
      );
      setFilteredResults(filtered);
      calculateSummaries(filtered);
    } else {
      setFilteredResults(gameResults);
      calculateSummaries(gameResults);
    }
  };

  const calculateSummaries = (results) => {
    const sessionData = {};
    let totalTime = 0;

    results.forEach((result) => {
      totalTime += result.response_time;

      const sessionNumber = result.lesson_number;

      if (!sessionData[sessionNumber]) {
        sessionData[sessionNumber] = {
          totalQuestions: 0,
          correctResponses: 0,
          totalResponseTime: 0,
          questions: [],
        };
      }

      sessionData[sessionNumber].totalQuestions += 1;
      sessionData[sessionNumber].totalResponseTime += result.response_time;

      if (result.response_correctness) {
        sessionData[sessionNumber].correctResponses += 1;
      }

      sessionData[sessionNumber].questions.push({
        questionNumber: result.question_number,
        responseCorrectness: result.response_correctness,
        responseTime: result.response_time,
      });
    });

    // Calculate average response time for each session
    for (const sessionNumber in sessionData) {
      const session = sessionData[sessionNumber];
      session.averageResponseTime = (
        session.totalResponseTime / session.totalQuestions
      ).toFixed(2);
    }

    setUserSessions(sessionData);
    setTotalSpentTime(totalTime);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="game-results-container">
      <h2 className="page-title">Audiogame Results</h2>

      <div className="search-container">
        <input
          type="text"
          className="user-id-input"
          placeholder="Enter User ID"
          value={userId}
          onChange={handleUserIdChange}
        />
      </div>

      {filteredResults.length === 0 ? (
        <p className="no-results-message">
          No game results found for the entered user ID.
        </p>
      ) : (
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Session Number</th>
                <th>Question Number</th>
                <th>Response Correctness</th>
                <th>Response Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result._id}>
                  <td>{result.user_id}</td>
                  <td>{result.lesson_number}</td>
                  <td>{result.question_number}</td>
                  <td>
                    {result.response_correctness ? "Correct" : "Incorrect"}
                  </td>
                  <td>{result.response_time}s</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary-container">
            <h3>Session-wise Summary</h3>
            {Object.keys(userSessions).map((sessionNumber) => (
              <div className="session-summary" key={sessionNumber}>
                <h4>Session {sessionNumber}</h4>
                <p>
                  Total Questions:{" "}
                  {userSessions[sessionNumber].totalQuestions}
                </p>
                <p>
                  Correct Responses:{" "}
                  {userSessions[sessionNumber].correctResponses}
                </p>
                <p>
                  Average Response Time:{" "}
                  {userSessions[sessionNumber].averageResponseTime}s
                </p>
                <p>
                  Total Time Spent:{" "}
                  {userSessions[sessionNumber].totalResponseTime.toFixed(
                    2
                  )}s
                </p>
                <h5>Questions:</h5>
                <ul>
                  {userSessions[sessionNumber].questions.map(
                    (question, index) => (
                      <li key={index}>
                        Question {question.questionNumber}:{" "}
                        {question.responseCorrectness
                          ? "Correct"
                          : "Incorrect"}{" "}
                        ({question.responseTime}s)
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="total-time">
            <h3>Total Spent Time: {totalSpentTime.toFixed(2)} seconds</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameResults;
