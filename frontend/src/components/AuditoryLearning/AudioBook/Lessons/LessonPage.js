import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [voices, setVoices] = useState([]);
  const [countdown, setCountdown] = useState(5); // Countdown starting from 5 seconds
  const [transcription, setTranscription] = useState("");

  useEffect(() => {
    const getVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      setVoices(allVoices.filter((voice) => voice.name.toLowerCase().includes("female")));
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
  };

  const readLessonPart = (index) => {
    if (index >= lesson.text.length) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lesson.text[index]?.text || lesson.text[index]);
    const selectedVoice = voices.find((voice) => voice.name.toLowerCase().includes("female"));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.lang = "en-US";

    utterance.onend = () => {
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
        const selectedVoice = voices.find((voice) => voice.name.toLowerCase().includes("female"));
        if (selectedVoice) {
          questionUtterance.voice = selectedVoice;
        }
      }

      questionUtterance.rate = 0.8;
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
        activateSpeechRecognition(index);
      }
    }, 1000);
  };

  const activateSpeechRecognition = (index) => {
    setIsAskingQuestion(false);

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
              setTranscription(response.data.transcription);
              setCurrentIndex(index + 1);
              readLessonPart(index + 1);
            })
            .catch(() => {
              setError("Failed to transcribe audio.");
              setCurrentIndex(index + 1);
              readLessonPart(index + 1);
            });
        };

        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);
      })
      .catch(() => {
        setError("Failed to access the microphone.");
      });
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!lesson) return <p>Loading...</p>;

  return (
    <div>
      <h2>{lesson.title}</h2>
      {lesson.title === "The Sun and the Sky" && (
        <img src="https://example.com/sun-and-sky.jpg" alt="Sun and Sky" />
      )}
      <p>
        {lesson.text[currentIndex]?.text || lesson.text[currentIndex]}
      </p>

      {isAskingQuestion && (
        <div>
          <p>Question: {lesson.questions[questionIndex]?.text}</p>
          
        </div>
      )}

      <div>
        <button onClick={playAudio} disabled={isPlaying}>
          Play Audio
        </button>
        <button onClick={stopAudio} disabled={!isPlaying}>
          Stop Audio
        </button>
      </div>

      {isAskingQuestion && <p>Countdown: {countdown} seconds</p>}

      {transcription && (
        <div>
          <h3>Transcription Result:</h3>
          <p>{transcription}</p>
          
        </div>
      )}

<p>Answer: {lesson.questions[questionIndex]?.answer}</p>


    </div>
  );
};

export default LessonPage;
