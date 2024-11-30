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

  useEffect(() => {
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

    const utterance = new SpeechSynthesisUtterance(
      lesson.text[index]?.text || lesson.text[index]
    );
    utterance.lang = "en-US"; // Adjust the language/locale as needed
    utterance.onend = () => {
      // If there's a corresponding question for this part, ask it
      if (lesson.questions && lesson.questions[index]) {
        setIsAskingQuestion(true);
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
      questionUtterance.lang = "en-US"; // Adjust locale for question TTS
      questionUtterance.onend = () => {
        setIsAskingQuestion(false);
        // After the question, move to the next part of the lesson
        setCurrentIndex(index + 1);
        readLessonPart(index + 1);
      };
      speechSynthesis.speak(questionUtterance);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!lesson) return <p>Loading...</p>;

  return (
    <div>
      <h2>{lesson.title}</h2>
      {lesson.title === "sun and sky" && (
        <img src="https://example.com/sun-and-sky.jpg" alt="Sun and Sky" />
      )}
      <p>
        {lesson.text[currentIndex]?.text || lesson.text[currentIndex]} {/* Display current lesson text */}
      </p>
      <div>
        <button onClick={playAudio} disabled={isPlaying}>
          Play Audio
        </button>
        <button onClick={stopAudio} disabled={!isPlaying}>
          Stop Audio
        </button>
      </div>
    </div>
  );
};

export default LessonPage;
