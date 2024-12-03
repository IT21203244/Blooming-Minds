import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./CSS/Audiogame.css";

const AudiogamesList = () => {
  const [audiogames, setAudiogames] = useState([]);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [spentTime, setSpentTime] = useState(0);
  const [responseCorrectness, setResponseCorrectness] = useState(0);
  const [userId, setUserId] = useState("");  // User ID input state

  const location = useLocation();
  const lessonLNumber = location.state?.lessonLNumber;

  useEffect(() => {
    fetch("http://localhost:5000/api/get_audiogames")
      .then((response) => response.json())
      .then((data) => {
        if (data.audiogames) {
          const filteredAudiogames = data.audiogames.filter(
            (game) => game.number === lessonLNumber
          );
          setAudiogames(filteredAudiogames);
        } else {
          setError(data.message);
        }
      })
      .catch(() => {
        setError("An error occurred while fetching the audiogames.");
      });

    const getVoices = () => {
      const voicesList = window.speechSynthesis.getVoices();
      setVoices(voicesList);

      const femaleVoice = voicesList.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          voice.name.toLowerCase().includes("female")
      );
      setSelectedVoice(femaleVoice || voicesList[0]);
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = getVoices;
    }
    getVoices();
  }, [lessonLNumber]);

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
    }
    return () => clearInterval(countdown);
  }, [isTimerRunning, timer]);

  const playAudio = (text) => {
    if (!selectedVoice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = playSpeed;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setMessage(""); // Clear previous messages
      setTimer(60); // Reset the timer
      setSpentTime(0); // Reset spent time
      setIsTimerRunning(true); // Start the countdown
    };
  };

  const handleAnswerSelection = (selectedAnswer, correctAnswer) => {
    setIsTimerRunning(false);
    const correctness = selectedAnswer === correctAnswer ? 1 : 0;
    setResponseCorrectness(correctness);
    
    if (correctness === 1) {
      setMessage(`Correct! Time spent: ${spentTime} seconds`);
    } else {
      setMessage("Incorrect. Try again.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < audiogames.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setMessage("");
      setTimer(60);
      setResponseCorrectness(0); // Reset correctness
    } else {
      setMessage("You've reached the last question!");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setMessage("");
      setTimer(60);
      setResponseCorrectness(0); // Reset correctness
    }
  };

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
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}

      {/* User ID Input */}
      <div className="user-id-section">
        <label htmlFor="user-id">User ID:</label>
        <input
          id="user-id"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your User ID"
        />
      </div>

      <div className="game-card">
        {audiogames.length > 0 && (
          <>
            <h3  >{`Question ${currentQuestionIndex + 1}: ${audiogames[currentQuestionIndex].question}`}</h3>
            <p>Game Number: {audiogames[currentQuestionIndex].number}</p>
            <p>Question Index: {currentQuestionIndex + 1}</p>
            <p style={{ color: 'white' }}>Response Correctness: {responseCorrectness}</p>
            <p style={{ color: 'white' }}>Time Taken to Answer: {spentTime} seconds</p>

            {/* Play speed selector */}
            <label htmlFor="speed-select">Playback Speed:</label>
            <select
              id="speed-select"
              value={playSpeed}
              onChange={(e) => setPlaySpeed(parseFloat(e.target.value))}
              style={{ backgroundColor: "#f7d3f7", color: "#512a6b", borderRadius: "10px", padding: "5px" }}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            {/* Play question audio */}
            <button
              className="play-audio"
              onClick={() =>
                playAudio(`Simon says ${audiogames[currentQuestionIndex].question}`)
              }
              style={{
                backgroundColor: "#ffb3c1",
                color: "#512a6b",
                borderRadius: "20px",
                padding: "10px 20px",
                fontWeight: "bold",
              }}
            >
              Play Question Audio
            </button>

            <div className="timer" style={{ fontSize: "20px", color: "#ff6f61" }}>
              <p>Time Left: {timer} seconds</p>
            </div>

            <div className="answers" style={{ marginTop: "20px" }}>
              {audiogames[currentQuestionIndex].answers.map((answer, index) => (
                <div key={index} className="answer-container" style={{ marginBottom: "15px" }}>
                  <button
                    className="answer"
                    onClick={() =>
                      handleAnswerSelection(
                        answer,
                        audiogames[currentQuestionIndex].correct_answer
                      )
                    }
                    style={{
                      backgroundColor: "#b5e4d6",
                      color: "#512a6b",
                      borderRadius: "15px",
                      padding: "10px",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    {answer}
                  </button>
                  {audiogames[currentQuestionIndex].images[index] && (
                    <img
                      src={audiogames[currentQuestionIndex].images[index]}
                      alt={`Answer ${index + 1}`}
                      className="answer-image"
                      style={{ marginTop: "10px", borderRadius: "10px" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="navigation-buttons" style={{ marginTop: "20px" }}>
              <button
                className="prev-button"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                style={{
                  backgroundColor: "#f7d3f7",
                  color: "#512a6b",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                Previous
              </button>
              <button
                className="next-button"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === audiogames.length - 1}
                style={{
                  backgroundColor: "#f7d3f7",
                  color: "#512a6b",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                }}
              >
                Next
              </button>
            </div>

            <button
              className="submit-button"
              onClick={handleSubmit}
              style={{
                backgroundColor: "#ffb3c1",
                color: "#512a6b",
                borderRadius: "20px",
                padding: "15px 30px",
                fontWeight: "bold",
                marginTop: "20px",
              }}
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
