import React, { useState } from "react";
import axios from "axios";

const InsertGame = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([""]);
  const [images, setImages] = useState([""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...images];
    updatedImages[index] = value;
    setImages(updatedImages);
  };

  const addOption = () => {
    setAnswers([...answers, ""]);
    setImages([...images, ""]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const gameData = {
      question,
      answers,
      images,
      correct_answer: correctAnswer,
    };

    axios
      .post("http://localhost:5000/api/add_audiogame", gameData)
      .then((response) => {
        setSuccessMessage("Game added successfully!");
        setQuestion("");
        setAnswers([""]);
        setImages([""]);
        setCorrectAnswer("");
      })
      .catch((error) => {
        setErrorMessage(error.response?.data?.error || "Failed to add the game.");
      });
  };

  return (
    <div className="insertgame_container">
      <h1>Insert New Audio Game</h1>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="insertgame_input_group">
          <label>Question:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>
        <div className="insertgame_options_section">
          <h3>Options</h3>
          {answers.map((answer, index) => (
            <div key={index} className="insertgame_option_group">
              <label>Answer {index + 1}:</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                required
              />
              <label>Image URL {index + 1}:</label>
              <input
                type="text"
                value={images[index]}
                onChange={(e) => handleImageChange(index, e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addOption} className="insertgame_add_option">
            Add Option
          </button>
        </div>
        <div className="insertgame_correct_answer">
          <label>Correct Answer:</label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
          >
            <option value="">--Select Correct Answer--</option>
            {answers.map((answer, index) => (
              <option key={index} value={answer}>
                {answer}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="insertgame_submit_btn">
          Insert Game
        </button>
      </form>
    </div>
  );
};

export default InsertGame;
