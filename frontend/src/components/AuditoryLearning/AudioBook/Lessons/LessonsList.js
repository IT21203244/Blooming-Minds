import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LessonsList = () => {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/get_lessons")
      .then((response) => setLessons(response.data.lessons))
      .catch(() => setError("Failed to fetch lessons."));
  }, []);
  

  const handleStart = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <div>
      <h2>All Lessons</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {lessons.length > 0 ? (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson._id}>
              <h3>{lesson.title}</h3>
              <button onClick={() => handleStart(lesson._id)}>Start</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No lessons found</p>
      )}
    </div>
  );
};

export default LessonsList;
