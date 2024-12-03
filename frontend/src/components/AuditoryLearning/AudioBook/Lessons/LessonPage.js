import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CCS/LessonPage.css";

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [voices, setVoices] = useState([]);
  const [countdown, setCountdown] = useState(5);
  const [transcription, setTranscription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image";

  useEffect(() => {
    const getVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      setVoices(
        allVoices.filter((voice) => voice.name.toLowerCase().includes("female"))
      );
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = getVoices;
    } else {
      getVoices();
    }

    axios
      .get(`http://localhost:5000/api/get_lesson/${lessonId}`)
      .then((response) => setLesson(response.data.lesson))
      .catch(() => setError("Failed to fetch lesson."));
  }, [lessonId]);

  const playAudio = () => {
    if (lesson && lesson.text) {
      setIsPlaying(true);
      readLessonPart(currentIndex);
    }
  };

  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const readLessonPart = (index) => {
    if (index >= lesson.text.length) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      lesson.text[index]?.text || lesson.text[index]
    );
    const selectedVoice = voices.find((voice) =>
      voice.name.toLowerCase().includes("female")
    );

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = audioSpeed;
    utterance.pitch = 1.2;
    utterance.lang = "en-US";

    utterance.onend = () => {
      setAudioProgress(((index + 1) / lesson.text.length) * 100);
      if (lesson.questions && lesson.questions[index] && !isAskingQuestion) {
        setIsAskingQuestion(true);
        setQuestionIndex(index);
        askQuestion(index);
      } else {
        setCurrentIndex(index + 1);
        readLessonPart(index + 1);
      }
    };

    speechSynthesis.speak(utterance);
  };

  const askQuestion = (index) => {
    if (lesson.questions && lesson.questions[index]) {
      const question = lesson.questions[index].text;
      const questionUtterance = new SpeechSynthesisUtterance(question);

      if (voices.length > 0) {
        const selectedVoice = voices.find((voice) =>
          voice.name.toLowerCase().includes("female")
        );
        if (selectedVoice) {
          questionUtterance.voice = selectedVoice;
        }
      }

      questionUtterance.rate = audioSpeed;
      questionUtterance.pitch = 1.2;
      questionUtterance.lang = "en-US";

      questionUtterance.onend = () => {
        startCountdown(index);
      };

      speechSynthesis.speak(questionUtterance);
    }
  };

  const startCountdown = (index) => {
    let countdownTimer = countdown;
    const countdownInterval = setInterval(() => {
      if (countdownTimer > 0) {
        setCountdown(countdownTimer);
        countdownTimer--;
      } else {
        clearInterval(countdownInterval);
        setCountdown(5);
        activateSpeechRecognition(index, true);
      }
    }, 1000);
  };

  const activateSpeechRecognition = (index, isForQuestion = false) => {
    setIsRecording(true);
    setError("");
    setTranscription("");
    setIsLoading(true);
  
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
              const userTranscription = response.data.transcription;
              setTranscription(userTranscription);
  
              if (isForQuestion) {
                const correctAnswer =
                  lesson.questions[index]?.answer || "";
                const isCorrect =
                  userTranscription.trim().toLowerCase() ===
                  correctAnswer.trim().toLowerCase();
  
                if (isCorrect) {
                  setFeedback("Correct! Well done.");
                  alert("Correct! Well done.");
                } else {
                  setFeedback(
                    `Incorrect. The correct answer is: ${correctAnswer}`
                  );
                  alert(`Incorrect. The correct answer is: ${correctAnswer}`);
                }
  
                setTimeout(() => {
                  setFeedback("");
                  setIsAskingQuestion(false);
                  if (lesson.text[index + 1]) {
                    setCurrentIndex(index + 1);
                    readLessonPart(index + 1);
                  } else {
                    setCurrentIndex(index + 1);
                    setIsPlaying(false);
                  }
                }, 2000);
              } else {
                setIsRecording(false);
                setIsLoading(false);
              }
            })
            .catch(() => {
              setError("Failed to transcribe audio.");
              setIsRecording(false);
              setIsLoading(false);
            });
        };
  
        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);
      })
      .catch(() => {
        setError("Failed to access the microphone.");
        setIsRecording(false);
        setIsLoading(false);
      });
  };
  

  if (error) return <p className="error-message">{error}</p>;
  if (!lesson) return <p className="loading-message">Loading...</p>;

  return (
    <div className="lesson-page">
      <h2 className="lesson-title">{lesson.title}</h2>
      <img
        src={lesson.imageURL || DEFAULT_IMAGE_URL}
        alt={lesson.title}
        className="lesson-image"
      />
      <p className="lesson-text">
        {lesson.text[currentIndex]?.text || lesson.text[currentIndex]}
      </p>

      {isAskingQuestion && (
        <div className="question-box">
          <p className="question-text">
            Question: {lesson.questions[questionIndex]?.text}
          </p>
          <p className="answer-text">
            Answer: {lesson.questions[questionIndex]?.answer}
          </p>
        </div>
      )}

      <div className="controls">
        <button
          className="control-button"
          onClick={playAudio}
          disabled={isPlaying}
        >
          Play Audio
        </button>
        <button
          className="control-button"
          onClick={stopAudio}
          disabled={!isPlaying}
        >
          Stop Audio
        </button>
      </div>

      <div className="audio-progress-container">
        <div
          className="audio-progress"
          style={{ width: `${audioProgress}%` }}
        ></div>
      </div>

      <div className="speed-control">
        <label>Audio Speed</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={audioSpeed}
          onChange={(e) => setAudioSpeed(e.target.value)}
        />
        <span>{audioSpeed}x</span>
      </div>

      {isAskingQuestion && (
        <p className="countdown-timer">Countdown: {countdown} seconds</p>
      )}

      <div>
        <h1>Audio Transcription</h1>
        <button
          onClick={() => activateSpeechRecognition(currentIndex)}
          disabled={isRecording || isLoading}
        >
          {isRecording ? "Recording..." : "Start Recording"}
        </button>
        <p>{transcription}</p>
        <p>{feedback}</p>
      </div>
    </div>
  );
};

export default LessonPage;
