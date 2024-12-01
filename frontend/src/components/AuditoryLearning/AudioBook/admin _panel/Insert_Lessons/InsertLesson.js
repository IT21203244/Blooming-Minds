import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTh, faUser, faChartLine, faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './CSS/InsertLesson.css';
import Logo from "./CSS/Logo.png"

const InsertLesson = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageURL, setImageURL] = useState("");
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
      text: text.split("\n"),
      imageURL,
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
        setImageURL("");
        setQuestions([{ question: "", answer: "" }]);
      })
      .catch((error) => {
        setErrorMessage(
          error.response?.data?.error || "Failed to add the lesson."
        );
      });
  };

  return (
    <div className="insertlesson_container">
      {/* Sidebar */}
      {/* Sidebar */}
      <div className="auditory_sidebar">
        <div className="auditory_logo">
          <img src={Logo} alt="Blooming Logo" />
        </div>
        <nav className="auditory_nav">
          <a href="#" className="auditory_nav_item active">
            <FontAwesomeIcon icon={faHome} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faTh} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faUser} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faChartLine} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faCogs} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faSignOutAlt} className="auditory_icon" />
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="insertlesson_main">
        <div className="insertlesson_header">
          <input
            type="text"
            placeholder="Search Lesson"
            className="insertlesson_search"
          />
        </div>

        {/* Insert Lesson Form */}
        <div className="insertlesson_form_container">
          <h1>Insert New Lesson</h1>
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <form onSubmit={handleSubmit}>
            <div className="insertlesson_input_group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="insertlesson_input_group">
              <label>Lesson Text (separate paragraphs by new lines):</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="5"
                required
              ></textarea>
            </div>
            <div className="insertlesson_input_group">
              <label>Image URL:</label>
              <input
                type="text"
                value={imageURL}
                onChange={(e) => setImageURL(e.target.value)}
                required
              />
            </div>
            <div className="insertlesson_questions_section">
              <h3>Questions</h3>
              {questions.map((q, index) => (
                <div key={index} className="insertlesson_question_group">
                  <label>Question {index + 1}:</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) =>
                      handleQuestionChange(index, "question", e.target.value)
                    }
                    required
                  /> <tb></tb><tb></tb><tb></tb>
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
              <br></br>
              <button type="button" onClick={addQuestion} className="insertlesson_add_question">
                Add Question
              </button>
            </div>
            <button type="submit" className="insertlesson_submit_btn">Insert Lesson</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InsertLesson;
