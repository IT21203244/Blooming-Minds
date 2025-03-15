import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CCS/LessonPage.css";

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [audioSpeed, setAudioSpeed] = useState(1);
  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image";

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/get_lesson/${lessonId}`)
      .then((response) => {
        const lessonData = response.data.lesson;
        if (lessonData) {
          // Convert stored relative paths to absolute URLs
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
      <p className="lesson-text">{lesson.text}</p>

      {/* Display Audio Files */}
      {lesson.audio_files && lesson.audio_files.length > 0 && (
        <div className="audio-files">
          <h3>Lesson Audio</h3>
          {lesson.audio_files.map((audioFile, index) => (
            <div key={index} className="audio-file">
              <audio controls>
                <source src={audioFile} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>
      )}

      {/* Display Questions & Answers */}
      {lesson.questions && lesson.questions.length > 0 && (
        <div className="questions-section">
          <h3>Related Questions</h3>
          {lesson.questions.map((q, index) => (
            <div key={index} className="question-item">
              <h4>Question {index + 1}</h4>
              <audio controls>
                <source src={q.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p><strong>Answer:</strong> {q.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Speed Control */}
      <div className="speed-control">
        <label>Audio Speed</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={audioSpeed}
          onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default LessonPage;
