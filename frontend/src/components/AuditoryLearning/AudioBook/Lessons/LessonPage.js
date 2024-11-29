import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/get_lesson/${lessonId}`)
      .then((response) => setLesson(response.data.lesson))
      .catch(() => setError("Failed to fetch lesson."));
  }, [lessonId]);

  const playAudio = () => {
    if (lesson && lesson.text) {
      const utterance = new SpeechSynthesisUtterance(lesson.text.join(" "));
      speechSynthesis.speak(utterance);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!lesson) return <p>Loading...</p>;

  return (
    <div>
      <h2>{lesson.title}</h2>
      <p>{lesson.text.join(" ")}</p>
      <button onClick={playAudio}>Play Audio</button>
    </div>
  );
};

export default LessonPage;
