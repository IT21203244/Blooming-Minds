import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./CCS/LessonPage.css";

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
  const [countdown, setCountdown] = useState(0); // Countdown time
  const [isCounting, setIsCounting] = useState(false); // To track if countdown is active
  const [timerId, setTimerId] = useState(null);
  const [transcriptionResults, setTranscriptionResults] = useState([]); // To store transcription results
  const [showResults, setShowResults] = useState(false); // To toggle results visibility

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

    // Delay for 7 seconds before starting the countdown
    setTimeout(() => {
      setIsCounting(true); // Start counting
      setCountdown(5); // Set countdown to 5 seconds (or any desired time)

      const id = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setIsCounting(false); // Stop counting
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimerId(id);
    }, 7000); // 7-second delay

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
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
              clearInterval(timerId); // Stop the countdown
              setIsCounting(false); // Stop counting
            })
            .catch(() => {
              setRecordingError("Failed to transcribe audio.");
              setIsRecording(false);
              clearInterval(timerId); // Stop the countdown
              setIsCounting(false); // Stop counting
            });
        };

        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, 12000); // Stop recording after 12 seconds (7s delay + 5s countdown)
      })
      .catch(() => {
        setRecordingError("Failed to access the microphone.");
        setIsRecording(false);
        clearInterval(timerId); // Stop the countdown
        setIsCounting(false); // Stop counting
      });
  };

  const calculateMatchPercentage = (correct, user) => {
    if (!correct || !user) {
      setMatchPercentage(0);
      return;
    }

    const correctText = correct.toLowerCase().replace(/\s+/g, ""); // Remove spaces
    const userText = user.toLowerCase().replace(/\s+/g, ""); // Remove spaces

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
    const userId = localStorage.getItem("userId"); // Get userId from local storage

    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const transcriptionData = {
      userId: userId,
      lessonId: lessonId,
      correctness: matchPercentage, // Accuracy from progress bar
    };

    try {
      await axios.post("http://localhost:5000/api/insert_transcription", transcriptionData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Data inserted successfully");

      if (questionIndex < lesson.questions.length - 1) {
        setQuestionIndex((prev) => prev + 1);
      } else {
        // If it's the last question, reset the state or handle as needed
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
      const userId = localStorage.getItem("userId"); // Get userId from local storage
      if (!userId) {
        alert("User not logged in!");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/get_transcriptions");
      const allResults = response.data.transcriptions;

      // Filter results for the current user
      const userResults = allResults.filter((result) => result.userId === userId);

      setTranscriptionResults(userResults);
      setShowResults(true); // Show results section
    } catch (error) {
      console.error("Error fetching transcription results:", error);
    }
  };

  if (error) return <p className="audiolessonpage-error-message">{error}</p>;
  if (!lesson) return <p className="audiolessonpage-loading-message">Loading...</p>;

  return (
    <div className="audiolessonpage-page">
      <h2 className="audiolessonpage-title">{lesson.title} </h2>
      <h5 className="-title">Lesson ID: {lessonId}</h5>

      <img
        src={lesson.imageURL || DEFAULT_IMAGE_URL}
        alt={lesson.title}
        className="audiolessonpage-image"
      />
      <p className="audiolessonpage-text">{lesson.text}</p>

      {lesson.audio_files?.length > 0 && (
        <div className="audiolessonpage-audio-question-section">
          <h3>Lesson Audio {audioIndex + 1}/{lesson.audio_files.length}</h3>
          <audio key={audioIndex} controls>
            <source src={lesson.audio_files[audioIndex]} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="audiolessonpage-navigation-buttons">
            <button
              onClick={() => setAudioIndex((prev) => Math.max(prev - 1, 0))}
              disabled={audioIndex === 0}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setAudioIndex((prev) => Math.min(prev + 1, lesson.audio_files.length - 1))
              }
              disabled={audioIndex === lesson.audio_files.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {lesson.questions?.length > 0 && (
        <div className="audiolessonpage-audio-question-section">
          <h3>Question {questionIndex + 1}/{lesson.questions.length}</h3>
          <audio key={questionIndex} controls>
            <source src={lesson.questions[questionIndex].audio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <p><strong>Correct Answer:</strong> {lesson.questions[questionIndex].answer}</p>

          <button onClick={startRecording} disabled={isRecording}>
            {isRecording ? (isCounting ? `Countdown: ${countdown}s` : "Listening...") : "Tell Answer"}
          </button>

          {userTranscription && (
            <div className="transcription-result">
              <h3>Your Response:</h3>
              <p>{userTranscription}</p>
              <div className="audiobookpage-progress-container">
                <h3>Accuracy</h3>
                <div className="audiobookpage-progress-bar">
                  <CircularProgressbar
                    value={matchPercentage}
                    text={`${matchPercentage}%`}
                    styles={buildStyles({
                      textColor: "#000",
                      pathColor: matchPercentage > 70 ? "green" : matchPercentage > 40 ? "orange" : "red",
                      trailColor: "#eee",
                      textSize: "16px",
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {recordingError && <p className="error-message">{recordingError}</p>}

          <div className="audiolessonpage-navigation-buttons">
            <button
              onClick={() => {
                setQuestionIndex((prev) => Math.max(prev - 1, 0));
                setUserTranscription("");
                setRecordingError("");
                setMatchPercentage(0);
              }}
              disabled={questionIndex === 0}
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={isRecording}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Button to check final results */}
      <div className="audiolessonpage-results-section">
        <button onClick={fetchTranscriptionResults} className="results-button">
          Check Final Results
        </button>

        {showResults && (
          <div className="results-display">
            <h3>Today's Transcription Results</h3>
            {transcriptionResults.length > 0 ? (
              <ul>
                {transcriptionResults.map((result, index) => (
                  <li key={index}>
                    <p><strong>User ID:</strong> {result.userId}</p>
                    <p><strong>Lesson ID:</strong> {result.lessonId}</p>
                    <p><strong>Correctness:</strong> {result.correctness}%</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No results found for today.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;