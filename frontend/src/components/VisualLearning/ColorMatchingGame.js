import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ColorMatchingGame.css";
import axios from "axios";

const colors = ["red", "blue", "green", "yellow", "purple"];

// User pool
const userPool = ["user_123", "user_456", "user_789"];

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
  const [errorCount, setErrorCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(null);

  useEffect(() => {
    const { sequenceLength, timeLimit } = levelConfig[level] || levelConfig.easy;

    const generatedSequence = Array.from({ length: sequenceLength }, () =>
      colors[Math.floor(Math.random() * colors.length)]
    );
    setSequence(generatedSequence);
    setInputSequence(Array(sequenceLength).fill(""));

    const timer = setTimeout(() => {
      setIsHidden(true);
    }, timeLimit);

    return () => clearTimeout(timer);
  }, [level]);

  const handleDrop = (color, index) => {
    const updatedSequence = [...inputSequence];
    updatedSequence[index] = color;

    if (!startDragTime) {
      setStartDragTime(Date.now());
    }

    if (color !== sequence[index]) {
      setErrorCount((prev) => prev + 1);
    }

    setInputSequence(updatedSequence);
  };

  const handleDone = () => {
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

    const totalScore = Math.floor((correctCount / sequence.length) * 100);

    // Randomly select a user_id from the user pool
    const randomUserId = userPool[Math.floor(Math.random() * userPool.length)];

    const resultData = {
      user_id: randomUserId,
      level,
      wrong_takes: errorCount,
      correct_takes: correctCount,
      total_score: totalScore,
      time_taken: totalTimeTaken,
      provided_sequence: sequence, // Save the system-provided sequence
      child_sequence: inputSequence, // Save the child's input sequence
      date: new Date().toISOString(), // Capture the current date and time
    };

    axios
      .post("http://localhost:5000/visual_learning/color_matching_game", resultData)
      .then((response) => {
        alert(
          `User ID: ${randomUserId}\nSelected Level: ${level}\nWrong Takes: ${errorCount}\nCorrect Takes: ${correctCount}\nTotal Score: ${totalScore} / 100\nTime Taken: ${totalTimeTaken} seconds\nResult ID: ${response.data.result_id}`
        );
      })
      .catch((error) => {
        alert(`Error saving result: ${error.response?.data?.error || error.message}`);
      });
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
              onDrop={(e) => handleDrop(e.dataTransfer.getData("color"), index)}
            >
              {inputSequence[index] && (
                <div
                  className="filled-circle"
                  style={{ backgroundColor: inputSequence[index] }}
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
              onDragStart={(e) => e.dataTransfer.setData("color", color)}
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>

        <button className="done-button" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
};

export default ColorMatchingGame;
