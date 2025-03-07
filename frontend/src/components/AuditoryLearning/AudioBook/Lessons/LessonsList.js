import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CCS/LessonsList.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faTh,
  faUser,
  faChartLine,
  faCogs,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import Logo from "./CCS/Logo.png";

const LessonsList = () => {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/300x200?text=No+Image";

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/get_lessons")
      .then((response) => {
        const fetchedLessons = response.data.lessons;
        setLessons(fetchedLessons);
      })
      .catch(() => setError("Failed to fetch lessons."));
  }, []);

  const handleStartAudioBook = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleStartAudioGame = (lessonLNumber) => {
    navigate(`/audiogames`, { state: { lessonLNumber: lessonLNumber } });
  };

  return (
    <div className="lessons_container">
 

      <div className="content">
        <h2 className="lessons_title">All Lessons</h2>
        {error && <p className="lessons_error">{error}</p>}
        {lessons.length > 0 ? (
          <div className="lessons_list">
            {lessons.map((lesson) => (
              <div className="lesson_card" key={lesson._id}>
                <img
                  src={lesson.imageURL || DEFAULT_IMAGE_URL}
                  alt={lesson.title}
                  className="lesson_image"
                />
                <div className="lesson_content">
                <h3 className="lesson_title">Lesson - {lesson.lnumber}</h3>
                  <h3 className="lesson_title">{lesson.title}</h3>
                  <button
                    className="lesson_button"
                    onClick={() => handleStartAudioBook(lesson._id)}
                  >
                    Start AudioBook
                  </button>
                  <button
                    className="lesson_button"
                    onClick={() => handleStartAudioGame(lesson.lnumber)}
                  >
                    Start AudioGame
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="lessons_empty">No lessons found</p>
        )}
      </div>
    </div>
  );
};

export default LessonsList;
