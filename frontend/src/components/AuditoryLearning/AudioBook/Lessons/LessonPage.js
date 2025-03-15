import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CCS/LessonPage.css";

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image";

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/get_lesson/${lessonId}`)
      .then((response) => {
        const lessonData = response.data.lesson;
        if (lessonData) {
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

  const totalSteps = Math.max(lesson.audio_files?.length || 0, lesson.questions?.length || 0);
  const stepSize = 4; // Number of sections displayed at once

  return (
    <div className="lesson-page">
      <h2 className="lesson-title">{lesson.title}</h2>
      <img src={lesson.imageURL || DEFAULT_IMAGE_URL} alt={lesson.title} className="lesson-image" />
      <p className="lesson-text">{lesson.text}</p>

      {/* Step-by-Step Audio Navigation */}
      <div className="step-navigation">
        <h3>Lesson Audio & Questions</h3>
        {[...Array(stepSize)].map((_, index) => {
          const stepIndex = currentStep + index;
          return stepIndex < totalSteps ? (
            <div key={stepIndex} className="audio-question-section">
              {lesson.audio_files?.[stepIndex] && (
                <div className="audio-file">
                  <h4>Lesson Audio {stepIndex + 1}</h4>
                  <audio controls>
                    <source src={lesson.audio_files[stepIndex]} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {lesson.questions?.[stepIndex] && (
                <div className="question-item">
                  <h4>Question {stepIndex + 1}</h4>
                  <audio controls>
                    <source src={lesson.questions[stepIndex].audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <p><strong>Answer:</strong> {lesson.questions[stepIndex].answer}</p>
                </div>
              )}
            </div>
          ) : null;
        })}

        <div className="navigation-buttons">
          <button onClick={() => setCurrentStep((prev) => Math.max(prev - stepSize, 0))} disabled={currentStep === 0}>
            Previous
          </button>
          <button onClick={() => setCurrentStep((prev) => Math.min(prev + stepSize, totalSteps - stepSize))} disabled={currentStep >= totalSteps - stepSize}>
            Next
          </button>
        </div>
      </div>

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