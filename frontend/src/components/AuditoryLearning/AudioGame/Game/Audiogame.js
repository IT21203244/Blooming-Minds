import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to get state
import "./CSS/Audiogame.css";

const AudiogamesList = () => {
  const [audiogames, setAudiogames] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation(); // Get location object to access state
  const lessonLNumber = location.state?.lessonLNumber; // Extract lessonLNumber from state

  useEffect(() => {
    fetch("http://localhost:5000/api/get_audiogames")
      .then((response) => response.json())
      .then((data) => {
        if (data.audiogames) {
          // Filter the audiogames based on lesson.lnumber
          const filteredAudiogames = data.audiogames.filter(
            (game) => game.number === lessonLNumber
          );
          setAudiogames(filteredAudiogames);
        } else {
          setError(data.message);
        }
      })
      .catch((err) => {
        setError("An error occurred while fetching the audiogames.");
      });
  }, [lessonLNumber]); // Depend on lessonLNumber to refetch data if it changes

  return (
    <div className="audiogame-list">
      <h1>List of Audiogames</h1>
      {error && <p className="error">{error}</p>}
      <div className="games-container">
        {audiogames.length > 0 ? (
          audiogames.map((game) => (
            <div key={game._id} className="game-card">
              <h3>{game.question}</h3>
              <p>Number: {game.number}</p>
              <div className="answers">
                {game.answers.map((answer, index) => (
                  <div key={index} className="answer">
                    <p>{answer}</p>
                    <img
                      src={game.images[index]}
                      alt={`answer-${index}`}
                      className="answer-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No audiogames found for this lesson</p>
        )}
      </div>
    </div>
  );
};

export default AudiogamesList;
