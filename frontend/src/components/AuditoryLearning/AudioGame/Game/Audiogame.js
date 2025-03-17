import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Card,
  Modal,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/system";
import correctSound from "./CSS/correct.mp3";
import incorrectSound from "./CSS/incorrect.mp3";

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

// Styled components for animations
const BouncingButton = styled(Button)({
  animation: `${bounce} 2s infinite`,
});

const AudiogamesList = () => {
  const [audiogames, setAudiogames] = useState([]);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(15);
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
      setTimer(15); // Reset timer
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
    <Box
      sx={{
        backgroundColor: "#f9f9f9",
        padding: "20px",
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
        color: "#512a6b",
        animation: `${fadeIn} 1s ease-in`,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          color: "#512a6b",
          mb: 2,
          fontSize: "3rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Lesson {lessonLNumber}
      </Typography>
      {message && (
        <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
          <Alert severity={responseCorrectness ? "success" : "error"}>{message}</Alert>
        </Snackbar>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: "15px", boxShadow: 3, padding: "20px" }}>
        {audiogames.length > 0 && (
          <>
            <Typography
              variant="h3"
              sx={{ mb: 2, fontSize: "2rem", fontWeight: "bold", textAlign: "center" }}
            >
              Question {currentQuestionIndex + 1}
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 2, fontSize: "1.5rem", textAlign: "center" }}
            >
              Time Taken: {spentTime} seconds
            </Typography>

            {/* Playback speed selector */}
            <Select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(parseFloat(e.target.value))}
              sx={{ mb: 2, width: "100%", fontSize: "1.2rem" }}
            >
              <MenuItem value={0.5}>0.5x</MenuItem>
              <MenuItem value={1}>1x</MenuItem>
              <MenuItem value={1.5}>1.5x</MenuItem>
              <MenuItem value={2}>2x</MenuItem>
            </Select>

            {/* Play question audio */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <BouncingButton
                variant="contained"
                sx={{
                  backgroundColor: "#ffb3c1",
                  color: "#512a6b",
                  fontSize: "2rem",
                  padding: "20px 40px",
                  "&:hover": { backgroundColor: "#ff8fa3" },
                }}
                onClick={() => playAudio(audiogames[currentQuestionIndex].audio)}
              >
                🎵 Play Audio
              </BouncingButton>
            </Box>

            <Modal open={showAnswerPopup} onClose={() => setShowAnswerPopup(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: 24,
      width: "600px", // Larger popup
      maxWidth: "90%", // Responsive width
    }}
  >
    <Typography
      variant="h5"
      sx={{ mb: 2, fontSize: "2rem", fontWeight: "bold", textAlign: "center" }}
    >
      Select the Correct Answer
    </Typography>

    {/* Timer Progress Bar */}
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ fontSize: "1.5rem", textAlign: "center" }}>
        Time Left: {timer} seconds
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(timer / 15) * 100} // 15 seconds is the initial timer
        sx={{
          height: "10px",
          borderRadius: "5px",
          backgroundColor: "#f7d3f7",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#ff6f61",
          },
        }}
      />
    </Box>

    {/* Answers */}
    <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap", mb: 2 }}>
      {audiogames[currentQuestionIndex].answers.map((answer, index) => (
        <Card
          key={index}
          sx={{
            cursor: "pointer",
            padding: "15px",
            border: "1px solid #512a6b",
            borderRadius: "10px",
            textAlign: "center",
            transition: "background-color 0.3s",
            "&:hover": { backgroundColor: "#f7d3f7" },
            backgroundColor:
              selectedAnswer === answer ? "#ffb3c1" : "transparent",
            width: "200px", // Fixed width for answer cards
          }}
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
              style={{
                width: "150px", // Larger image size
                height: "150px",
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
          )}
          <Typography sx={{ mt: 1, fontSize: "1.2rem" }}>{answer}</Typography>
        </Card>
      ))}
    </Box>

    {/* Submit Button */}
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#ffb3c1",
          color: "#512a6b",
          fontSize: "1.5rem",
          padding: "15px 30px",
          "&:hover": { backgroundColor: "#ff8fa3" },
        }}
        onClick={handleSubmit}
      >
        {responseCorrectness === 1 ? "OK" : "Try Again"}
      </Button>
    </Box>
  </Box>
</Modal>

            {/* Navigation buttons */}
            <Box sx={{ display: "flex", gap: "10px", mt: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#f7d3f7",
                  color: "#512a6b",
                  fontSize: "1.5rem",
                  padding: "10px 20px",
                  "&:hover": { backgroundColor: "#e6b3e6" },
                }}
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#f7d3f7",
                  color: "#512a6b",
                  fontSize: "1.5rem",
                  padding: "10px 20px",
                  "&:hover": { backgroundColor: "#e6b3e6" },
                }}
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === audiogames.length - 1}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};

export default AudiogamesList;