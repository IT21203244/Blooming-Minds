import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./CSS/Audiogame.css";
import correctSound from "./CSS/correct.mp3";
import incorrectSound from "./CSS/incorrect.mp3";


const AudiogamesList = () => {
  const [audiogames, setAudiogames] = useState([]);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [spentTime, setSpentTime] = useState(0);
  const [responseCorrectness, setResponseCorrectness] = useState(0);
  const [userId, setUserId] = useState("");
  const [showAnswerPopup, setShowAnswerPopup] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const location = useLocation();
  const lessonLNumber = location.state?.lessonLNumber;

  // Fetch userId from local storage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError("User ID not found. Please log in.");
    }
  }, []);

  // Fetch audiogames data
  useEffect(() => {
    fetch("http://localhost:5000/api/get_audiogames")
      .then((response) => response.json())
      .then((data) => {
        if (data.audiogames) {
          const filteredAudiogames = data.audiogames.filter(
            (game) => game.number === lessonLNumber
          );
          const updatedAudiogames = filteredAudiogames.map((game) => ({
            ...game,
            audio: `http://localhost:5000/api/${game.audio}`,
          }));
          setAudiogames(updatedAudiogames);
        } else {
          setError(data.message);
        }
      })
      .catch(() => {
        setError("An error occurred while fetching the audiogames.");
      });
  }, [lessonLNumber]);

  // Timer logic
  useEffect(() => {
    let countdown;
    if (isTimerRunning && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
        setSpentTime((prevSpentTime) => prevSpentTime + 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      setMessage("Time's up! Try again.");
      new Audio().play();
    }
    return () => clearInterval(countdown);
  }, [isTimerRunning, timer]);

  // Play audio and show answer popup
  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.playbackRate = playSpeed;
    audio.play();

    audio.onended = () => {
      setShowAnswerPopup(true); // Show answer popup
      setTimer(10); // Reset timer
      setSpentTime(0); // Reset spent time
      setIsTimerRunning(true); // Start countdown
    };
  };

  // Handle answer selection
  const handleAnswerSelection = (selectedAnswer, correctAnswer) => {
    setIsTimerRunning(false);
    setSelectedAnswer(selectedAnswer);

    if (selectedAnswer === correctAnswer) {
      new Audio(correctSound).play();
      setResponseCorrectness(1);
      setMessage("Correct! Great job!");
    } else {
      new Audio(incorrectSound).play();
      setResponseCorrectness(0);
      setMessage("Incorrect. Try again.");
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < audiogames.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setMessage("");
      setTimer(60);
      setResponseCorrectness(0);
      setSelectedAnswer(null);
      setShowAnswerPopup(false);
    } else {
      alert("You've reached the last question!");
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setMessage("");
      setTimer(60);
      setResponseCorrectness(0);
      setSelectedAnswer(null);
      setShowAnswerPopup(false);
    }
  };

  // Handle result submission
  const handleSubmit = () => {
    const resultData = {
      user_id: userId,
      lesson_number: audiogames[currentQuestionIndex].number,
      question_number: currentQuestionIndex + 1,
      response_correctness: responseCorrectness,
      response_time: spentTime,
    };

    fetch("http://localhost:5000/api/add_audiogame_result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setMessage("Result added successfully!");
        } else {
          setMessage("Error adding result.");
        }
      })
      .catch(() => {
        setMessage("An error occurred while submitting the result.");
      });
  };

  return (
    <div className="audiogame-list">
      <h1>Lesson {lessonLNumber}</h1>
      {message && <p className="audiogame-message">{message}</p>}
      {error && <p className="audiogame-error">{error}</p>}

      <div className="audiogame-card">
        {audiogames.length > 0 && (
          <>
            <h3>{`Question ${currentQuestionIndex + 1}`}</h3>
            <p>Time Taken: {spentTime} seconds</p>

            {/* Playback speed selector */}
            <label htmlFor="speed-select">Playback Speed:</label>
            <select
              id="speed-select"
              className="audiogame-select"
              value={playSpeed}
              onChange={(e) => setPlaySpeed(parseFloat(e.target.value))}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            {/* Play question audio */}
            <button
              className="audiogame-button audiogame-play-button"
              onClick={() => playAudio(audiogames[currentQuestionIndex].audio)}
            >
              Play Question Audio
            </button>

            {/* Timer */}
            <div className="audiogame-timer">
              <p>Time Left: {timer} seconds</p>
            </div>

            {/* Answer popup */}
            {showAnswerPopup && (
              <div className="audiogame-answer-popup">
                <h3>Select the Correct Answer</h3>
                <div className="audiogame-answer-container">
                  {audiogames[currentQuestionIndex].answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`audiogame-answer-card ${
                        selectedAnswer === answer ? "audiogame-selected" : ""
                      }`}
                      onClick={() =>
                        handleAnswerSelection(
                          answer,
                          audiogames[currentQuestionIndex].correct_answer
                        )
                      }
                    >
                      {audiogames[currentQuestionIndex].images[index] && (
                        <img
                          src={audiogames[currentQuestionIndex].images[index]}
                          alt={`Answer ${index + 1}`}
                          className="audiogame-answer-image"
                        />
                      )}
                      <p>{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="audiogame-navigation-buttons">
              <button
                className="audiogame-button audiogame-prev-button"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className="audiogame-button audiogame-next-button"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === audiogames.length - 1}
              >
                Next
              </button>
            </div>

            {/* Submit button */}
            <button
              className="audiogame-button audiogame-submit-button"
              onClick={handleSubmit}
            >
              Submit Result
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AudiogamesList;