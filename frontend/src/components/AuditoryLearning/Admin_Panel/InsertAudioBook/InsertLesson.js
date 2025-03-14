import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTh, faUser, faChartLine, faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './CSS/InsertLesson.css';
import Logo from "./CSS/Logo.png";

const InsertLesson = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [lnumber, setLnumber] = useState("");
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [audioFiles, setAudioFiles] = useState([""]);
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

  const handleAudioChange = (index, file) => {
    const updatedAudioFiles = [...audioFiles];
    updatedAudioFiles[index] = file;
    setAudioFiles(updatedAudioFiles);
  };

  const addAudioField = () => {
    setAudioFiles([...audioFiles, ""]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text", text);
    formData.append("imageURL", imageURL);
    formData.append("lnumber", lnumber);
    formData.append("questions", JSON.stringify(questions.map((q, index) => ({
      question_id: index + 1,
      text: q.question,
      answer: q.answer,
    }))));

    audioFiles.forEach((file) => {
      if (file) formData.append("audio_files", file);
    });

    axios
      .post("http://localhost:5000/api/add_lesson", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setSuccessMessage("Lesson added successfully!");
        setTitle("");
        setText("");
        setImageURL("");
        setLnumber("");
        setQuestions([{ question: "", answer: "" }]);
        setAudioFiles([""]);
      })
      .catch((error) => {
        setErrorMessage(error.response?.data?.error || "Failed to add the lesson.");
      });
  };

  return (
    <div className="insertlesson_container">
      <div className="insertlesson_main">
        <h1>Insert New Lesson</h1>
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="insertlesson_input_group">
            <label>Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="insertlesson_input_group">
            <label>Lesson Text:</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows="5" required></textarea>
          </div>
          <div className="insertlesson_input_group">
            <label>Image URL:</label>
            <input type="text" value={imageURL} onChange={(e) => setImageURL(e.target.value)} required />
          </div>
          <div className="insertlesson_input_group">
            <label>Lesson Number:</label>
            <input type="text" value={lnumber} onChange={(e) => setLnumber(e.target.value)} required />
          </div>
          <div className="insertlesson_input_group">
            <label>Audio Files (MP3):</label>
            {audioFiles.map((file, index) => (
              <div key={index}>
                <input type="file" accept=".mp3" onChange={(e) => handleAudioChange(index, e.target.files[0])} required />
              </div>
            ))}
            <button type="button" onClick={addAudioField} className="insertlesson_add_audio">Add Another Audio</button>
          </div>
          <div className="insertlesson_questions_section">
            <h3>Questions</h3>
            {questions.map((q, index) => (
              <div key={index} className="insertlesson_question_group">
                <label>Question {index + 1}:</label>
                <input type="text" value={q.question} onChange={(e) => handleQuestionChange(index, "question", e.target.value)} required />
                <label>Answer:</label>
                <input type="text" value={q.answer} onChange={(e) => handleQuestionChange(index, "answer", e.target.value)} required />
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="insertlesson_add_question">Add Question</button>
          </div>
          <button type="submit" className="insertlesson_submit_btn">Insert Lesson</button>
        </form>
      </div>
    </div>
  );
};

export default InsertLesson;
