import React, { useState, useEffect } from "react";
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
  const [audiobookResults, setAudiobookResults] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [combinedResults, setCombinedResults] = useState({});
  const [expandedLesson, setExpandedLesson] = useState(null); // State to track expanded lesson

  useEffect(() => {
    // Fetch userId from local storage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const fetchGameResults = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_audiogame_results"
        );
        setGameResults(response.data.audiogame_results);
        filterResultsByUserId(response.data.audiogame_results, storedUserId);
      } catch (err) {
        console.error("Error fetching game results:", err);
      }
    };

    const fetchAudiobookResults = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_transcriptions"
        );
        setAudiobookResults(response.data.transcriptions);
      } catch (err) {
        console.error("Error fetching audiobook results:", err);
      }
    };

    const fetchLessons = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/get_lessons");
        setLessons(response.data.lessons);
      } catch (err) {
        console.error("Error fetching lessons:", err);
      }
    };

    fetchGameResults();
    fetchAudiobookResults();
    fetchLessons();
  }, []);

  useEffect(() => {
    if (lessons.length > 0 && gameResults.length > 0 && audiobookResults.length > 0) {
      combineResultsByLesson();
    }
  }, [lessons, gameResults, audiobookResults]);

  const filterResultsByUserId = (results, userId) => {
    if (userId) {
      const filtered = results.filter((result) => result.user_id === userId);
      setFilteredResults(filtered);
      calculateSummaries(filtered);
    } else {
      setFilteredResults(results);
      calculateSummaries(results);
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

  const combineResultsByLesson = () => {
    const combined = {};

    lessons.forEach((lesson) => {
      const lessonId = lesson._id;
      const lessonNumber = lesson.lnumber;

      const audiogameResultsForLesson = gameResults.filter(
        (result) => result.lesson_number === lessonNumber && result.user_id === userId
      );

      const audiobookResultsForLesson = audiobookResults.filter(
        (result) => result.lessonId === lessonId && result.userId === userId
      );

      combined[lessonNumber] = {
        audiogameResults: audiogameResultsForLesson,
        audiobookResults: audiobookResultsForLesson,
      };
    });

    setCombinedResults(combined);
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

  const calculateCorrectnessPercentage = (results) => {
    if (results.length === 0) return 0;
    const correctCount = results.filter((result) => result.correctness).length;
    return ((correctCount / results.length) * 100).toFixed(2);
  };

  const getLessonNumber = (lessonId) => {
    const lesson = lessons.find((lesson) => lesson._id === lessonId);
    return lesson ? lesson.lnumber : "N/A";
  };

  const toggleLessonDetails = (lessonNumber) => {
    if (expandedLesson === lessonNumber) {
      setExpandedLesson(null); // Collapse if already expanded
    } else {
      setExpandedLesson(lessonNumber); // Expand the clicked lesson
    }
  };

  return (
    <div className="game-results-container">
      <h2 className="page-title">Lesson Results</h2>

      {Object.keys(combinedResults).length === 0 ? (
        <p>No results found for the current user.</p>
      ) : (
        Object.keys(combinedResults).map((lessonNumber) => (
          <div key={lessonNumber} className="lesson-results-container">
            <div className="lesson-header" onClick={() => toggleLessonDetails(lessonNumber)}>
              <h3>Lesson {lessonNumber}</h3>
              <span>{expandedLesson === lessonNumber ? "▼" : "▶"}</span>
            </div>

            {expandedLesson === lessonNumber && (
              <>
                <div className="audiogame-results">
                  <h4>Audiogame Results</h4>
                  {combinedResults[lessonNumber].audiogameResults.length === 0 ? (
                    <p>No audiogame results found for this lesson.</p>
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
                          {combinedResults[lessonNumber].audiogameResults.map((result) => (
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
                  )}
                </div>

                <div className="audiobook-results">
                  <h4>Audiobook Results</h4>
                  {combinedResults[lessonNumber].audiobookResults.length === 0 ? (
                    <p>No audiobook results found for this lesson.</p>
                  ) : (
                    <div className="results-table-container">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>User ID</th>
                            <th>Lesson ID</th>
                            <th>Lesson Number</th>
                            <th>Correctness</th>
                          </tr>
                        </thead>
                        <tbody>
                          {combinedResults[lessonNumber].audiobookResults.map((result, index) => (
                            <tr key={index}>
                              <td>{result.userId}</td>
                              <td>{result.lessonId}</td>
                              <td>{getLessonNumber(result.lessonId)}</td>
                              <td>{result.correctness ? "Correct" : "Incorrect"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Display Charts for Audiogame Results */}
                <div className="charts-container">
                  <h4>Charts for Audiogame Results</h4>
                  <div className="chart-container">
                    {generateSessionChart(lessonNumber)}
                  </div>
                  <div className="chart-container">
                    {generatePieChart(lessonNumber)}
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}

      {/* Display Comparison Chart Across All Sessions */}
      <div className="comparison-chart-container">
        <h3>Comparison Across All Sessions</h3>
        <div className="chart-container">
          {generateComparisonChart()}
        </div>
      </div>
    </div>
  );
};

export default GameResults;