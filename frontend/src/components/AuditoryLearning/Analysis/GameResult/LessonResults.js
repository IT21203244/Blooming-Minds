import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import "./CSS/GameResults.css";

// Register the necessary elements for all charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement, // Register for Pie chart
  Title,
  Tooltip,
  Legend,
  PointElement
);

const GameResults = () => {
  const [gameResults, setGameResults] = useState([]);
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
        console.error("Error fetching game results:", err);
      }
    };

    fetchGameResults();
  }, []);

  const handleUserIdChange = (e) => {
    const id = e.target.value;
    setUserId(id);

    if (id) {
      const filtered = gameResults.filter((result) => result.user_id === id);
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
          incorrectResponses: 0,
          totalResponseTime: 0,
          speedOfAnswering: 0,
          memory: 0,
        };
      }

      sessionData[sessionNumber].totalQuestions += 1;
      sessionData[sessionNumber].totalResponseTime += result.response_time;

      if (result.response_correctness) {
        sessionData[sessionNumber].correctResponses += 1;
      } else {
        sessionData[sessionNumber].incorrectResponses += 1;
      }

      sessionData[sessionNumber].speedOfAnswering += result.response_time;
      sessionData[sessionNumber].memory += result.response_correctness ? 1 : 0;
    });

    for (const sessionNumber in sessionData) {
      const session = sessionData[sessionNumber];
      session.averageResponseTime = (
        session.totalResponseTime / session.totalQuestions
      ).toFixed(2);
    }

    setUserSessions(sessionData);
    setTotalSpentTime(totalTime);
  };

  const generateSessionChart = (sessionNumber) => {
    const session = userSessions[sessionNumber];
    if (!session) return null;

    return (
      <Bar
        data={{
          labels: ["Speed of Answering", "Memory"],
          datasets: [
            {
              label: `Session ${sessionNumber} Metrics`,
              data: [
                session.speedOfAnswering / session.totalQuestions, 
                session.memory, 
              ],
              backgroundColor: ["#36a2eb", "#ff6384"],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: `Session ${sessionNumber}` },
          },
        }}
      />
    );
  };

  const generateComparisonChart = () => {
    const sessionNumbers = Object.keys(userSessions);
    return (
      <Line
        data={{
          labels: sessionNumbers,
          datasets: [
            {
              label: "Average Speed of Answering",
              data: sessionNumbers.map(
                (num) =>
                  userSessions[num].speedOfAnswering /
                  userSessions[num].totalQuestions
              ),
              borderColor: "#36a2eb",
              tension: 0.3,
            },
            {
              label: "Memory Score",
              data: sessionNumbers.map((num) => userSessions[num].memory),
              borderColor: "#ff6384",
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: "Comparison Across Sessions" },
          },
        }}
      />
    );
  };

  const generatePieChart = (sessionNumber) => {
    const session = userSessions[sessionNumber];
    if (!session) return null;

    return (
      <Pie
        data={{
          labels: ["Correct", "Incorrect"],
          datasets: [
            {
              label: `Session ${sessionNumber} Correctness`,
              data: [session.correctResponses, session.incorrectResponses],
              backgroundColor: ["#36a2eb", "#ff6384"],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: `Session ${sessionNumber} Correctness` },
          },
        }}
      />
    );
  };

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
        <p>No results found for the entered user ID.</p>
      ) : (
        <>
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
                    <td>{result.response_correctness ? "Correct" : "Incorrect"}</td>
                    <td>{result.response_time}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="results-summary-container">
            <h3>Summary for User ID: {userId}</h3>
            <div className="summary-container">
              {Object.keys(userSessions).map((sessionNumber) => (
                <div className="session-summary" key={sessionNumber}>
                  <h4>Session {sessionNumber}</h4>
                  <p>Total Questions: {userSessions[sessionNumber].totalQuestions}</p>
                  <p>
                    Average Response Time:{" "}
                    {userSessions[sessionNumber].averageResponseTime}s
                  </p>
                  <p>Correct Responses: {userSessions[sessionNumber].correctResponses}</p>
                  <p>Incorrect Responses: {userSessions[sessionNumber].incorrectResponses}</p>
                  <div className="chart-container">
                    {generatePieChart(sessionNumber)}
                  </div>
                  <div className="chart-container">
                    {generateSessionChart(sessionNumber)}
                  </div>
                </div>
              ))}
              <div className="chart-container">{generateComparisonChart()}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameResults;
