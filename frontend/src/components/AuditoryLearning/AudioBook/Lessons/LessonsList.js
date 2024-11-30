import React, { useState, useEffect } from "react";
import axios from "axios";

const LessonsList = () => {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch lessons from backend when the component mounts
    axios
    .get("http://localhost:5000/api/get_lessons")
    .then((response) => {
      console.log(response.data); // Log response for debugging
      setLessons(response.data.lessons);
    })
    .catch((error) => {
      console.error(error); // Log error for debugging
      setError("Failed to fetch lessons.");
    });
  
  }, []);

  return (
    <div>
      <h2>All Lessons</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {lessons.length > 0 ? (
        <ul>
          {lessons.map((lesson, index) => (
            <li key={index}>
              <h3>{lesson.title}</h3>
              <p>{lesson.text.join(" ")}</p> {/* Assuming text is an array of paragraphs */}
              <h4>Questions:</h4>
              <ul>
                {lesson.questions.map((question, idx) => (
                  <li key={idx}>
                    <strong>Q:</strong> {question.text}
                    <br />
                    <strong>A:</strong> {question.answer}
                  </li>
                ))}
              </ul>
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
