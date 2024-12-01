import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CCS/LessonsList.css";

const LessonsList = () => {
  const [lessons, setLessons] = useState([]);
  const [images, setImages] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const UNSPLASH_API_KEY = "your_unsplash_api_key"; // Replace with your Unsplash API Key

  useEffect(() => {
    // Fetch lessons from the server
    axios
      .get("http://localhost:5000/api/get_lessons")
      .then((response) => {
        const fetchedLessons = response.data.lessons;
        setLessons(fetchedLessons);

        // Fetch images for each lesson title
        fetchedLessons.forEach((lesson) => {
          fetchImageForLesson(lesson.title);
        });
      })
      .catch(() => setError("Failed to fetch lessons."));
  }, []);

  const fetchImageForLesson = (title) => {
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/300/200`;
    setImages((prevImages) => ({
      ...prevImages,
      [title]: imageUrl,
    }));
  };
  
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
                src={images[lesson.title] || "https://via.placeholder.com/250x150?text=Loading..."}
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
