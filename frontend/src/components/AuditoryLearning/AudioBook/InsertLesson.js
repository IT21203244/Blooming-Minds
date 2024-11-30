import React, { useState } from "react";
import axios from "axios";

const InsertLesson = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", answer: "" }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const lessonData = {
      title,
      text: text.split("\n"), // Split text into an array of paragraphs
      questions: questions.map((q, index) => ({
        question_id: index + 1,
        text: q.question,
        answer: q.answer,
      })),
    };

    axios
      .post("http://localhost:5000/api/add_lesson", lessonData)
      .then((response) => {
        setSuccessMessage("Lesson added successfully!");
        setTitle("");
        setText("");
        setQuestions([{ question: "", answer: "" }]);
      })
      .catch((error) => {
        setErrorMessage(
          error.response?.data?.error || "Failed to add the lesson."
        );
      });
  };

  return (
    <div>
      <h1>Insert New Lesson</h1>
      <h1>Insert</h1>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Lesson Text (separate paragraphs by new lines):</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="5"
            required
          ></textarea>
        </div>
        <div>
          <h3>Questions</h3>
          {questions.map((q, index) => (
            <div key={index}>
              <label>Question {index + 1}:</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(index, "question", e.target.value)
                }
                required
              />
              <label>Answer:</label>
              <input
                type="text"
                value={q.answer}
                onChange={(e) =>
                  handleQuestionChange(index, "answer", e.target.value)
                }
                required
              />
            </div>
          ))}
          <button type="button" onClick={addQuestion}>
            Add Question
          </button>
        </div>
        <button type="submit">Insert Lesson</button>
      </form>
    </div>
  );
};

export default InsertLesson;
