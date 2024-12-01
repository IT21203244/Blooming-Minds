import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CCS/LessonsList.css";

const LessonsList = () => {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/300x200?text=No+Image"; // Default image URL

  useEffect(() => {
    // Fetch lessons from the server
    axios
      .get("http://localhost:5000/api/get_lessons")
      .then((response) => {
        const fetchedLessons = response.data.lessons;
        setLessons(fetchedLessons);
      })
      .catch(() => setError("Failed to fetch lessons."));
  }, []);

  const handleStart = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <div className="lessons_container">
      <h2 className="lessons_title">All Lessons</h2>
      {error && <p className="lessons_error">{error}</p>}
      {lessons.length > 0 ? (
        <div className="lessons_list">
          {lessons.map((lesson) => (
            <div className="lesson_card" key={lesson._id}>
              <img
                src={lesson.imageURL || DEFAULT_IMAGE_URL} // Use lesson's imageURL or default
                alt={lesson.title}
                className="lesson_image"
              />
              <div className="lesson_content">
                <h3 className="lesson_title">{lesson.title}</h3>
                <button
                  className="lesson_button"
                  onClick={() => handleStart(lesson._id)}
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="lessons_empty">No lessons found</p>
      )}
    </div>
  );
};

export default LessonsList;
