import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/GameResults.css';

const GameResults = () => {
  const [gameResults, setGameResults] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [lessonSummary, setLessonSummary] = useState({});
  const [userSummary, setUserSummary] = useState({});

  useEffect(() => {
    const fetchGameResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_audiogame_results');
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
      const filtered = gameResults.filter(result => result.user_id === id);
      setFilteredResults(filtered);
      calculateSummaries(filtered);
    } else {
      setFilteredResults(gameResults);
      calculateSummaries(gameResults);
    }
  };

  const calculateSummaries = (results) => {
    const lessonSummary = {};
    const userSummary = {};

    results.forEach(result => {
      const lessonNumber = result.lesson_number;
      const userId = result.user_id;

      // Lesson-wise summary
      if (!lessonSummary[lessonNumber]) {
        lessonSummary[lessonNumber] = {
          totalGames: 0,
          correctResponses: 0,
          totalResponseTime: 0,
        };
      }

      lessonSummary[lessonNumber].totalGames += 1;
      if (result.response_correctness) {
        lessonSummary[lessonNumber].correctResponses += 1;
      }
      lessonSummary[lessonNumber].totalResponseTime += result.response_time;

      // User-wise summary
      if (!userSummary[userId]) {
        userSummary[userId] = {
          totalGames: 0,
          correctResponses: 0,
          totalResponseTime: 0,
        };
      }

      userSummary[userId].totalGames += 1;
      if (result.response_correctness) {
        userSummary[userId].correctResponses += 1;
      }
      userSummary[userId].totalResponseTime += result.response_time;
    });

    // Calculate averages and percentages for lesson-wise and user-wise summaries
    for (let lessonNumber in lessonSummary) {
      const lesson = lessonSummary[lessonNumber];
      lesson.averageResponseTime = (lesson.totalResponseTime / lesson.totalGames).toFixed(2);
      lesson.correctnessPercentage = ((lesson.correctResponses / lesson.totalGames) * 100).toFixed(2);
    }

    for (let userId in userSummary) {
      const user = userSummary[userId];
      user.averageResponseTime = (user.totalResponseTime / user.totalGames).toFixed(2);
      user.correctnessPercentage = ((user.correctResponses / user.totalGames) * 100).toFixed(2);
    }

    setLessonSummary(lessonSummary);
    setUserSummary(userSummary);
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
        <p className="no-results-message">No game results found for the entered user ID.</p>
      ) : (
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Lesson Number</th>
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
                  <td>{result.response_correctness ? 'Correct' : 'Incorrect'}</td>
                  <td>{result.response_time}s</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary-container">
          

            <div className="user-summary">
              <h3>User-wise Summary</h3>
              {Object.keys(userSummary).map((userId) => (
                <div className="user-summary-item" key={userId}>
                  <h4>User {userId}</h4>
                  <p>Total Games: {userSummary[userId].totalGames}</p>
                  <p>Correct Responses: {userSummary[userId].correctResponses}</p>
                  <p>Correctness Percentage: {userSummary[userId].correctnessPercentage}%</p>
                  <p>Average Response Time: {userSummary[userId].averageResponseTime}s</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameResults;
