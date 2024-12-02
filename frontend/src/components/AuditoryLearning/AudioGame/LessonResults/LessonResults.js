// src/components/GameResults.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GameResults = () => {
  const [gameResults, setGameResults] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [lessonSummary, setLessonSummary] = useState({});

  useEffect(() => {
    // Fetch all game results when the component is mounted
    const fetchGameResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_audiogame_results'); // Ensure correct API endpoint
        setGameResults(response.data.audiogame_results); // Set all results to the state
        setFilteredResults(response.data.audiogame_results); // Initially, display all results

        // Calculate lesson-wise summary for all results
        calculateLessonSummary(response.data.audiogame_results);
      } catch (err) {
        setError("An error occurred while fetching the game results.");
      }
    };

    fetchGameResults();
  }, []);

  const handleUserIdChange = (e) => {
    const id = e.target.value;
    setUserId(id);

    // Filter the results based on the user ID
    if (id) {
      const filtered = gameResults.filter(result => result.user_id === id);
      setFilteredResults(filtered);
      calculateLessonSummary(filtered); // Recalculate summary based on filtered results
    } else {
      setFilteredResults(gameResults); // Show all results if no user ID is entered
      calculateLessonSummary(gameResults); // Recalculate summary for all results
    }
  };

  const calculateLessonSummary = (results) => {
    const summary = {};

    // Loop through each result and group by lesson_number
    results.forEach(result => {
      const lessonNumber = result.lesson_number;

      if (!summary[lessonNumber]) {
        summary[lessonNumber] = {
          totalGames: 0,
          correctResponses: 0,
          totalResponseTime: 0,
        };
      }

      // Update the summary for the current lesson
      summary[lessonNumber].totalGames += 1;
      if (result.response_correctness) {
        summary[lessonNumber].correctResponses += 1;
      }
      summary[lessonNumber].totalResponseTime += result.response_time;
    });

    // Calculate the average response time and correctness percentage for each lesson
    for (let lessonNumber in summary) {
      const lesson = summary[lessonNumber];
      lesson.averageResponseTime = (lesson.totalResponseTime / lesson.totalGames).toFixed(2);
      lesson.correctnessPercentage = ((lesson.correctResponses / lesson.totalGames) * 100).toFixed(2);
    }

    setLessonSummary(summary); // Set the calculated summary to the state
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Audiogame Results</h2>

      {/* Input field to get the user ID */}
      <input
        type="text"
        placeholder="Enter User ID"
        value={userId}
        onChange={handleUserIdChange}
      />

      {filteredResults.length === 0 ? (
        <p>No game results found for the entered user ID.</p>
      ) : (
        <div>
          <table>
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

          {/* Lesson-wise Summary */}
          <div>
            <h3>Lesson-wise Summary</h3>
            {Object.keys(lessonSummary).map((lessonNumber) => (
              <div key={lessonNumber}>
                <h4>Lesson {lessonNumber}</h4>
                <p>Total Games: {lessonSummary[lessonNumber].totalGames}</p>
                <p>Correct Responses: {lessonSummary[lessonNumber].correctResponses}</p>
                <p>Correctness Percentage: {lessonSummary[lessonNumber].correctnessPercentage}%</p>
                <p>Average Response Time: {lessonSummary[lessonNumber].averageResponseTime}s</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameResults;
