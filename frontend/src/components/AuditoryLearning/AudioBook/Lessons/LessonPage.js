import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Container,
  Typography, 
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Mic, NavigateBefore, NavigateNext, CheckCircle, Stop } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#4caf50", // Green
    },
    background: {
      default: "#f5f5f5", // Light gray
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    body1: {
      fontSize: "1.1rem",
    },
  },
});

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [audioIndex, setAudioIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userTranscription, setUserTranscription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMicPopup, setShowMicPopup] = useState(false);
  const [recordingTime, setRecordingTime] = useState(12);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [averageCorrectness, setAverageCorrectness] = useState(0); // New state for average correctness

  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image";

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/get_lesson/${lessonId}`)
      .then((response) => {
        const lessonData = response.data.lesson;
        if (lessonData) {
          if (lessonData.audio_files) {
            lessonData.audio_files = lessonData.audio_files.map(
              (file) => `http://localhost:5000/${file}`
            );
          }
          if (lessonData.questions) {
            lessonData.questions = lessonData.questions.map((q) => ({
              audio: `http://localhost:5000/${q.audio}`,
              answer: q.answer,
            }));
          }
        }
        setLesson(lessonData);
      })
      .catch(() => setError("Failed to fetch lesson."));
  }, [lessonId]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingError("");
    setUserTranscription("");
    setMatchPercentage(0);
    setShowMicPopup(true);
    setRecordingTime(60);

    const id = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsRecording(false);
          setShowMicPopup(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerId(id);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorderInstance = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorderInstance.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorderInstance.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("file", audioBlob, "recorded_audio.wav");

          axios
            .post("http://localhost:5000/record", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
              const userText = response.data.transcription;
              setUserTranscription(userText);
              calculateMatchPercentage(lesson.questions[questionIndex].answer, userText);
              setIsRecording(false);
              clearInterval(timerId);
              setShowMicPopup(false);
            })
            .catch(() => {
              setRecordingError("Failed to transcribe audio.");
              setIsRecording(false);
              clearInterval(timerId);
              setShowMicPopup(false);
            });
        };

        mediaRecorderInstance.start();
        setMediaRecorder(mediaRecorderInstance);
        setTimeout(() => {
          mediaRecorderInstance.stop();
        }, 12000);
      })
      .catch(() => {
        setRecordingError("Failed to access the microphone.");
        setIsRecording(false);
        clearInterval(timerId);
        setShowMicPopup(false);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      clearInterval(timerId);
      setIsRecording(false);
      setShowMicPopup(false);
    }
  };

  const calculateMatchPercentage = (correct, user) => {
    if (!correct || !user) {
      setMatchPercentage(0);
      return;
    }

    const correctText = correct.toLowerCase().replace(/\s+/g, "");
    const userText = user.toLowerCase().replace(/\s+/g, "");

    let matchCount = 0;
    for (let i = 0; i < Math.min(correctText.length, userText.length); i++) {
      if (correctText[i] === userText[i]) {
        matchCount++;
      }
    }

    const totalLetters = correctText.length;
    const percentage = (matchCount / totalLetters) * 100;

    setMatchPercentage(Math.round(percentage));
  };

  const handleNextQuestion = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const transcriptionData = {
      userId: userId,
      lessonId: lessonId,
      correctness: matchPercentage,
    };

    try {
      await axios.post("http://localhost:5000/api/insert_transcription", transcriptionData, {
        headers: { "Content-Type": "application/json" },
      });

      if (questionIndex < lesson.questions.length - 1) {
        setQuestionIndex((prev) => prev + 1);
      } else {
        setQuestionIndex(0);
      }

      setUserTranscription("");
      setRecordingError("");
      setMatchPercentage(0);
    } catch (error) {
      console.error("Error inserting transcription data:", error);
    }
  };

  const fetchTranscriptionResults = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not logged in!");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/get_transcriptions");
      const allResults = response.data.transcriptions;

      const userResults = allResults.filter(
        (result) => result.userId === userId && result.lessonId === lessonId
      );

      setTranscriptionResults(userResults);

      // Calculate average correctness
      if (userResults.length > 0) {
        const totalCorrectness = userResults.reduce((sum, result) => sum + result.correctness, 0);
        const average = totalCorrectness / userResults.length;
        setAverageCorrectness(Math.round(average));
      } else {
        setAverageCorrectness(0);
      }

      setShowResults(true);
    } catch (error) {
      console.error("Error fetching transcription results:", error);
    }
  };

  // Transform results for the bar chart
  const chartData = transcriptionResults.map((result, index) => ({
    name: `Attempt ${index + 1}`,
    correctness: result.correctness,
  }));

  if (error) return <Typography color="error">{error}</Typography>;
  if (!lesson) return <LinearProgress />;

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            {lesson.title} - Lesson{lesson.lnumber} {lessonId}
          </Typography>

          <CardMedia
            component="img"
            image={lesson.imageURL || DEFAULT_IMAGE_URL}
            alt={lesson.title}
            sx={{ borderRadius: 2, mb: 2 }}
          />

          {lesson.audio_files?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Lesson Audio {audioIndex + 1}/{lesson.audio_files.length}
              </Typography>
              <audio key={audioIndex} controls style={{ width: "100%" }}>
                <source src={lesson.audio_files[audioIndex]} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
                <Button
                  startIcon={<NavigateBefore />}
                  onClick={() => setAudioIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={audioIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  endIcon={<NavigateNext />}
                  onClick={() =>
                    setAudioIndex((prev) => Math.min(prev + 1, lesson.audio_files.length - 1))
                  }
                  disabled={audioIndex === lesson.audio_files.length - 1}
                >
                  Next
                </Button>
              </Grid>
            </Box>
          )}

          {lesson.questions?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Question {questionIndex + 1}/{lesson.questions.length}
              </Typography>
              <audio key={questionIndex} controls style={{ width: "100%" }}>
                <source src={lesson.questions[questionIndex].audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Correct Answer:</strong> {lesson.questions[questionIndex].answer}
              </Typography>

              <Button
                variant="contained"
                startIcon={<Mic />}
                onClick={startRecording}
                disabled={isRecording}
                sx={{ mt: 2 }}
              >
                {isRecording ? `Recording... ${recordingTime}s` : "Tell Me"}
              </Button>

              {userTranscription && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Your Response:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userTranscription}
                  </Typography>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6">Accuracy</Typography>
                    <CircularProgressbar
                      value={matchPercentage}
                      text={`${matchPercentage}%`}
                      styles={buildStyles({
                        textColor: "#000",
                        pathColor: matchPercentage > 70 ? "green" : matchPercentage > 40 ? "orange" : "red",
                        trailColor: "#eee",
                        textSize: "16px",
                      })}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </Box>
                </Box>
              )}

              {recordingError && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {recordingError}
                </Typography>
              )}

              <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
                <Button
                  startIcon={<NavigateBefore />}
                  onClick={() => {
                    setQuestionIndex((prev) => Math.max(prev - 1, 0));
                    setUserTranscription("");
                    setRecordingError("");
                    setMatchPercentage(0);
                  }}
                  disabled={questionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  endIcon={<NavigateNext />}
                  onClick={handleNextQuestion}
                  disabled={isRecording}
                  sx={{
                    backgroundColor: matchPercentage >= 80 ? "primary.main" : "error.main",
                    "&:hover": {
                      backgroundColor: matchPercentage >= 80 ? "primary.dark" : "error.dark",
                    },
                  }}
                >
                  {matchPercentage >= 80 ? "Next" : "Try Again..."}
                </Button>
              </Grid>
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CheckCircle />}
              onClick={fetchTranscriptionResults}
            >
              Check Final Results
            </Button>

            {showResults && (
              <Paper sx={{ mt: 3, p: 3 }}>
                <Typography variant="h6">Today's Transcription Results</Typography>
                {transcriptionResults.length > 0 ? (
                  <>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Average Correctness: {averageCorrectness}%
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="correctness" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <Typography>No results found for today.</Typography>
                )}
              </Paper>
            )}
          </Box>
        </Card>
      </Container>

      {/* Mic Popup */}
      <Dialog open={showMicPopup} onClose={() => setShowMicPopup(false)}>
        <DialogTitle>Recording in Progress</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Mic sx={{ fontSize: 60, color: "primary.main" }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {recordingTime}s remaining
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Stop />}
            onClick={stopRecording}
            sx={{ mt: 2 }}
          >
            Stop Recording
          </Button>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default LessonPage;