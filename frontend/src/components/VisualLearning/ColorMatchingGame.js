import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ColorMatchingGame.css";
import axios from "axios";

const colors = ["red", "blue", "green", "yellow", "purple"];

const levelConfig = {
  easy: {
    sequenceLength: 3,
    timeLimit: 10000,
  },
  medium: {
    sequenceLength: 5,
    timeLimit: 8000,
  },
  hard: {
    sequenceLength: 7,
    timeLimit: 6000,
  },
};

const ColorMatchingGame = () => {
  const { level } = useParams();
  const [sequence, setSequence] = useState([]);
  const [inputSequence, setInputSequence] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [startDragTime, setStartDragTime] = useState(null);
  const [circleCount, setCircleCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [availableCircles, setAvailableCircles] = useState(10);
  const [recommendedLevel, setRecommendedLevel] = useState(null);

  useEffect(() => {
    const { sequenceLength, timeLimit } = levelConfig[level] || levelConfig.easy;

    const generatedSequence = Array.from({ length: sequenceLength }, () =>
      colors[Math.floor(Math.random() * colors.length)]
    );
    setSequence(generatedSequence);

    const timer = setTimeout(() => {
      setIsHidden(true);
    }, timeLimit);

    return () => clearTimeout(timer);
  }, [level]);

  const handleDropEmptyCircle = (index) => {
    if (availableCircles > 0) {
      const updatedSequence = [...inputSequence];
      updatedSequence[index] = "empty";
      setInputSequence(updatedSequence);
      setCircleCount((prev) => prev + 1);
      setAvailableCircles((prev) => prev - 1);
    }
  };

  const handleDropColor = (color, index) => {
    const updatedSequence = [...inputSequence];
    updatedSequence[index] = color;

    if (!startDragTime) {
      setStartDragTime(Date.now());
    }

    setInputSequence(updatedSequence);
  };

  const handleDone = async () => {
    if (!startDragTime) {
      alert("No actions were performed!");
      return;
    }

    const endTime = Date.now();
    const totalTimeTaken = Math.floor((endTime - startDragTime) / 1000);
    setTimeTaken(totalTimeTaken);

    const correctCount = inputSequence.filter(
      (color, idx) => color === sequence[idx]
    ).length;

    const emptyCircles = inputSequence.filter((color) => color === "").length;
    const wrongCount = sequence.length - correctCount - emptyCircles;

    const totalScore = Math.floor((correctCount / sequence.length) * 100);

    const resultData = {
      level,
      wrong_takes: wrongCount + emptyCircles,
      correct_takes: correctCount,
      total_score: totalScore,
      time_taken: totalTimeTaken,
      provided_sequence: sequence,
      child_sequence: inputSequence,
      circle_count: circleCount,
      date: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("User is not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/visual_learning/color_matching_game",
        resultData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.result_id) {
        alert(
          `Selected Level: ${level}\nWrong Takes: ${
            wrongCount + emptyCircles
          }\nCorrect Takes: ${correctCount}\nTotal Score: ${totalScore} / 100\nTime Taken: ${totalTimeTaken} seconds\nResult ID: ${response.data.result_id}`
        );

        setResultData(response.data);
        setFeedback(response.data.feedback);
        setRecommendedLevel(response.data.recommended_level); // Handle the recommended level
      } else {
        alert("Failed to save result, please try again.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else {
        alert(
          `Error saving result: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }
  };

  return (
    <div className="color-matching-game">
      <div className="sidebar"></div>

      <div className="game-container">
        <h1>Level: {level.toUpperCase()}</h1>

        <div className="color-sequence">
          {sequence.map((color, index) => (
            <div
              key={index}
              className={`circle ${isHidden ? "hidden" : ""}`}
              style={{ backgroundColor: color }}
            ></div>
          ))}
          {isHidden && <div className="overlay"></div>}
        </div>

        <div className="drop-zone">
          {Array.from({ length: sequence.length }).map((_, index) => (
            <div
              key={index}
              className="empty-circle"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const data = e.dataTransfer.getData("type");
                if (data === "empty-circle") {
                  handleDropEmptyCircle(index);
                } else {
                  handleDropColor(data, index);
                }
              }}
            >
              {inputSequence[index] && (
                <div
                  className="filled-circle"
                  style={{
                    backgroundColor:
                      inputSequence[index] === "empty"
                        ? "lightgray"
                        : inputSequence[index],
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="color-options">
          {colors.map((color) => (
            <div
              key={color}
              className="color-option"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("type", color)}
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>

        <div className="empty-circle-pool">
          {Array.from({ length: availableCircles }).map((_, index) => (
            <div
              key={index}
              className="empty-circle"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("type", "empty-circle")}
            ></div>
          ))}
        </div>

        <button className="done-button" onClick={handleDone}>
          Done
        </button>

        <div className="circle-count">
          <h3>Circles Filled: {circleCount}</h3>
        </div>

        {feedback && (
          <div className="feedback">
            <h3>Feedback</h3>
            <p>{feedback}</p>
          </div>
        )}

        {resultData && (
          <div className="result-summary">
            <h3>Result Summary</h3>
            <p><strong>Level:</strong> {level}</p>
            <p><strong>Wrong Takes:</strong> {resultData.wrong_takes}</p>
            <p><strong>Correct Takes:</strong> {resultData.correct_takes}</p>
            <p><strong>Total Score:</strong> {resultData.total_score} / 100</p>
            <p><strong>Time Taken:</strong> {resultData.time_taken} seconds</p>
            <p><strong>Circle Count:</strong> {resultData.circle_count}</p>
            {recommendedLevel && (
              <p><strong>Recommended Level:</strong> {recommendedLevel}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorMatchingGame;
