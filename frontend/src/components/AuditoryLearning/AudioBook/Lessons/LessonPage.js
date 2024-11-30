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

  useEffect(() => {
    // Fetch available voices on page load
    const getVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      setVoices(allVoices.filter((voice) => voice.name.toLowerCase().includes('female')));
    };

    // Wait for voices to be available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = getVoices;
    } else {
      getVoices();
    }

    // Fetch lesson details
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
      setIsPlaying(false); // Stop if all parts are read
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lesson.text[index]?.text || lesson.text[index]);
    const selectedVoice = voices.find((voice) => voice.name.toLowerCase().includes("female"));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Slow speech rate for better clarity for children
    utterance.rate = 0.8; // Slow down the speech rate
    utterance.pitch = 1.2; // Slightly higher pitch for a softer voice
    utterance.lang = "en-US"; // Adjust the language to English

    utterance.onend = () => {
      // If there's a corresponding question for this part, ask it
      if (lesson.questions && lesson.questions[index] && !isAskingQuestion) {
        setIsAskingQuestion(true);
        setQuestionIndex(index);
        askQuestion(index);
      } else {
        // Move to the next part of the lesson if no question
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

      questionUtterance.rate = 0.8; // Slow down the question speech rate
      questionUtterance.pitch = 1.2; // Soft pitch for the question
      questionUtterance.lang = "en-US"; // Language of the question

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
        clearInterval(countdownInterval); // Stop countdown when it reaches 0
        setCountdown(5); // Reset countdown for the next time
        setIsAskingQuestion(false);
        // After countdown ends, resume lesson
        setCurrentIndex(index + 1);
        readLessonPart(index + 1); // Continue the lesson after countdown
      }
    }, 1000); // Decrease countdown every second
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
        {lesson.text[currentIndex]?.text || lesson.text[currentIndex]} {/* Display current lesson text */}
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

      {isAskingQuestion && (
        <div>
          <p>Countdown: {countdown} seconds</p>
        </div>
      )}
    </div>
  );
};

export default LessonPage;
