import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FetchColorMatchingData.css";
import "font-awesome/css/font-awesome.min.css"; // For the eye icon
import { Pie } from "react-chartjs-2"; // Importing the Pie chart component
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement); // Register the chart elements

const FetchColorMatchingData = () => {
  const [results, setResults] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null); // Store the selected result for viewing
  const [isModalOpen, setIsModalOpen] = useState(false); // To control the modal visibility
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const rowsPerPage = 25; // Rows per page

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const url = userId
        ? `http://localhost:5000/visual_learning/color_matching_game?user_id=${userId}`
        : `http://localhost:5000/visual_learning/color_matching_game`;

      const response = await axios.get(url);

      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to the first page when searching
    fetchData();
  };

  // Function to open the modal with the selected result
  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setIsModalOpen(!isModalOpen); // Toggle the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  // Function to render the color balls for provided and child sequences
  const renderColorBalls = (sequence) => {
    return sequence.map((color, index) => (
      <span key={index} className="color-ball" style={{ backgroundColor: color }}></span>
    ));
  };

  // Pie chart data for wrong and correct takes
  const getPieChartData = (wrongTakes, correctTakes) => {
    return {
      labels: ["Wrong Takes", "Correct Takes"],
      datasets: [
        {
          data: [wrongTakes, correctTakes],
          backgroundColor: ["#ff595e", "#4caf50"],
          borderColor: ["#ff595e", "#4caf50"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = results.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(results.length / rowsPerPage);

  return (
    <div className="fetch-home">
      <h1>Color Matching Game Results</h1>

      <div className="fetch-sub">
        <label className="by-uid">
          Search by User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <table border="1">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Level</th>
                <th>Wrong Takes</th>
                <th>Correct Takes</th>
                <th>Total Score</th>
                <th>Time Taken</th>
                <th>Provided Sequence</th>
                <th>Child Sequence</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((result, index) => (
                <tr key={index}>
                  <td>{result.user_id}</td>
                  <td>{result.level}</td>
                  <td>{result.wrong_takes}</td>
                  <td>{result.correct_takes}</td>
                  <td>{result.total_score}</td>
                  <td>{result.time_taken}</td>
                  <td>{result.provided_sequence.join(", ")}</td>
                  <td>{result.child_sequence.join(", ")}</td>
                  <td>{result.date}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(result)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal to display selected result details */}
      {isModalOpen && selectedResult && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>
              &times;
            </span>
            <h3>Details for User ID: {selectedResult.user_id}</h3>
            <p>
              <strong>Level:</strong> {selectedResult.level}
            </p>
            <p>
              <strong>Total Score:</strong> {selectedResult.total_score}
            </p>
            <p>
              <strong>Time Taken:</strong> {selectedResult.time_taken}
            </p>

            {/* Pie chart for wrong and correct takes */}
            <div className="pie-chart">
              <Pie
                data={getPieChartData(
                  selectedResult.wrong_takes,
                  selectedResult.correct_takes
                )}
              />
            </div>

            <p>
              <strong>Provided Sequence:</strong>
            </p>
            <div className="color-sequence">
              {renderColorBalls(selectedResult.provided_sequence)}
            </div>

            <p>
              <strong>Child Sequence:</strong>
            </p>
            <div className="color-sequence">
              {renderColorBalls(selectedResult.child_sequence)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchColorMatchingData;
