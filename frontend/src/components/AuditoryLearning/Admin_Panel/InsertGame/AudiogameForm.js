import React, { useState } from "react";
import axios from "axios";
import "./CSS/InsertGame.css";

const InsertGame = () => {
  const [number, setNumber] = useState("");
  const [questions, setQuestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { audio: null, answers: [""], images: [""], correct_answer: "" },
    ]);
  };

  const handleAudioChange = (index, file) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].audio = file;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers[aIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleImageChange = (qIndex, iIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].images[iIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].correct_answer = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers.push("");
    updatedQuestions[qIndex].images.push("");
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("number", number);
    formData.append("questions", JSON.stringify(questions));

    // Append each audio file to FormData
    questions.forEach((q, index) => {
      if (q.audio) {
        formData.append(`audio_${index}`, q.audio);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/add_audiogame",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSuccessMessage("Games added successfully!");
      setNumber("");
      setQuestions([]);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || "Failed to add the games."
      );
    }
  };

  return (
    <div className="insertgame_container">
      <h1>Insert New Audio Games</h1>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="insertgame_input_group">
          <label>Number:</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="insertgame_question_section">
            <div className="insertgame_input_group">
              <label>Upload Question Audio (MP3, WAV, OGG):</label>
              <input
                type="file"
                accept=".mp3, .wav, .ogg"
                onChange={(e) =>
                  handleAudioChange(qIndex, e.target.files[0])
                }
                required
              />
            </div>
            <div className="insertgame_options_section">
              <h3>Options</h3>
              {q.answers.map((answer, aIndex) => (
                <div key={aIndex} className="insertgame_option_group">
                  <label>Answer {aIndex + 1}:</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) =>
                      handleAnswerChange(qIndex, aIndex, e.target.value)
                    }
                    required
                  />
                  <label>Image URL {aIndex + 1}:</label>
                  <input
                    type="text"
                    value={q.images[aIndex]}
                    onChange={(e) =>
                      handleImageChange(qIndex, aIndex, e.target.value)
                    }
                    required
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="insertgame_add_option"
              >
                Add Option
              </button>
            </div>
            <div className="insertgame_correct_answer">
              <label>Correct Answer:</label>
              <select
                value={q.correct_answer}
                onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                required
              >
                <option value="">--Select Correct Answer--</option>
                {q.answers.map((answer, aIndex) => (
                  <option key={aIndex} value={answer}>
                    {answer}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="insertgame_add_question_btn"
        >
          Add Question
        </button>
        <button type="submit" className="insertgame_submit_btn">
          Insert Games
        </button>
      </form>
    </div>
  );
};

export default InsertGame;
