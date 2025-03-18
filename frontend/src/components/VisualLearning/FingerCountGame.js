import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import "./FingerCountingGame.css";
import { useParams } from "react-router-dom";

// Import images dynamically
import number1 from "./img/number_1.png";
import number2 from "./img/number_2.png";
import number3 from "./img/number_3.png";
import number4 from "./img/number_4.png";
import number5 from "./img/number_5.png";
import number6 from "./img/number_6.png";
import number7 from "./img/number_7.png";
import number8 from "./img/number_8.png";
import number9 from "./img/number_9.png";
import number10 from "./img/number_10.png";
import sticker1 from "./img/counting_sticker.png"; // Import sticker images
import sticker2 from "./img/gold_star.png";
import sticker3 from "./img/speedy_sticker.png";

const numberImages = {
  1: number1,
  2: number2,
  3: number3,
  4: number4,
  5: number5,
  6: number6,
  7: number7,
  8: number8,
  9: number9,
  10: number10,
};

const stickerImages = {
  "Counting Sticker": sticker1,
  "Streak Sticker": sticker2,
  "Level Complete Sticker": sticker3,
};

const FingerCountingGame = () => {
  const { level } = useParams();
  const [userId, setUserId] = useState(null);
  const [displayedNumbers, setDisplayedNumbers] = useState([]);
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timer, setTimer] = useState(20);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [badges, setBadges] = useState([]);
  const [stickers, setStickers] = useState([]); // New state for stickers
  const [feedback, setFeedback] = useState(""); // New state for motivational feedback
  const [showResultsPopup, setShowResultsPopup] = useState(false); // New state for results popup
  const [sessionResults, setSessionResults] = useState(null); // New state for session results
  const webcamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      setUserId(user.user_id);
    } else {
      alert("User is not authenticated. Please log in.");
    }
    generateNumberSequence();
  }, []);

  const generateNumberSequence = () => {
    let numbers = Array.from({ length: 10 }, (_, i) => i + 1);
    if (level === "hard") {
      numbers = numbers.sort(() => Math.random() - 0.5); // Shuffle for hard level
    }
    setDisplayedNumbers(numbers);
    setCurrentNumberIndex(0);
    setResults([]);
    setStartTime(new Date().getTime());
    setTimer(20);
    setStreak(0);
    setProgress(0);
    setBadges([]);
    setStickers([]); // Reset stickers on new game
    startTimer();
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFingerCountSubmission(); // Automatically submit if time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  };

  const countFingers = async (imageData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/visual_learning/hand_detection/count_fingers",
        { image: imageData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setFeedback(response.data.feedback); // Set motivational feedback
      return response.data.finger_count;
    } catch (error) {
      console.error("Error counting fingers:", error);
      return 0;
    }
  };

  const awardSticker = (stickerName) => {
    if (!stickers.includes(stickerName)) {
      setStickers(prevStickers => [...prevStickers, stickerName]);
    }
  };

  const handleFingerCountSubmission = async () => {
    const imageData = captureImage();
    if (!imageData) {
      alert("Please allow webcam access and try again.");
      return;
    }

    const endTime = new Date().getTime();
    const timeTaken = (endTime - startTime) / 1000;

    const displayedNumber = displayedNumbers[currentNumberIndex];
    const fingerCount = await countFingers(imageData); // Call the backend API
    const status = fingerCount === displayedNumber ? "Correct" : "Incorrect";

    const resultIndex = results.findIndex(result => result.displayed_number === displayedNumber);
    
    if (resultIndex === -1) {
      // First attempt for this number
      const result = {
        displayed_number: displayedNumber,
        finger_count: [fingerCount],
        status: [status],
        time_taken: [timeTaken],
        attempt_count_per_number: 1,
        reward: 0
      };
      setResults(prevResults => [...prevResults, result]);
    } else {
      // Subsequent attempt for this number
      const updatedResults = [...results];
      updatedResults[resultIndex].finger_count.push(fingerCount);
      updatedResults[resultIndex].status.push(status);
      updatedResults[resultIndex].time_taken.push(timeTaken);
      updatedResults[resultIndex].attempt_count_per_number += 1;
      setResults(updatedResults);
    }

    if (status === "Correct") {
      setIsCorrect(true);
      setStreak(prevStreak => prevStreak + 1);
      setProgress(prevProgress => prevProgress + 10);

      // Award stickers based on conditions
      if (streak + 1 >= 3) {
        awardSticker("Counting Sticker");
      }
      if (streak + 1 >= 5) {
        awardSticker("Streak Sticker");
      }

      setCurrentNumberIndex(prevIndex => prevIndex + 1);
      setAttemptCount(0);
      if (currentNumberIndex + 1 < displayedNumbers.length) {
        setStartTime(new Date().getTime());
        setTimer(20);
        startTimer();
      } else {
        awardSticker("Level Complete Sticker"); // Award sticker for completing the level
        await submitSessionResults();
      }
    } else {
      setIsCorrect(false);
      setStreak(0);
      setAttemptCount(prevCount => prevCount + 1);
      if ((level === "easy" && attemptCount + 1 >= 3) || (level === "hard" && attemptCount + 1 >= 2)) {
        setCurrentNumberIndex(prevIndex => prevIndex + 1);
        setAttemptCount(0);
        if (currentNumberIndex + 1 < displayedNumbers.length) {
          setStartTime(new Date().getTime());
          setTimer(20);
          startTimer();
        } else {
          await submitSessionResults();
        }
      }
    }
  };

  const submitSessionResults = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/visual_learning/hand_detection/submit_finger_count_session",
        {
          user_id: userId,
          number_data: results,
          total_attempt_count: results.reduce((sum, res) => sum + res.attempt_count_per_number, 0),
          level: level,
          badges: badges,
          stickers: stickers // Include stickers in the submission
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.message) {
        alert("Session results saved successfully!");
        await fetchSessionResults(response.data.result_id); // Fetch and display results
      }
    } catch (error) {
      console.error("Error submitting session results:", error);
    }
  };

  const fetchSessionResults = async (resultId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/visual_learning/hand_detection/get_finger_count_session/${resultId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setSessionResults(response.data);
      setShowResultsPopup(true); // Show the results popup
    } catch (error) {
      console.error("Error fetching session results:", error);
    }
  };

  const closeResultsPopup = () => {
    setShowResultsPopup(false); // Close the popup
    generateNumberSequence(); // Restart the game after closing the popup
  };

  const renderNumberImages = (number) => {
    const images = Array(number).fill(numberImages[number]);
    const firstRow = images.slice(0, 5);
    const secondRow = images.slice(5);

    return (
      <div className="number-images-container">
        <div className="image-row">
          {firstRow.map((src, index) => (
            <img key={index} src={src} alt={`Number ${number}`} className="number-image" />
          ))}
        </div>
        {secondRow.length > 0 && (
          <div className="image-row">
            {secondRow.map((src, index) => (
              <img key={index} src={src} alt={`Number ${number}`} className="number-image" />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="finger-counting-game">
      <div className="game-container">
        <div className="left-section">
          <h1>Finger Counting Game - {level}</h1>
          
          {currentNumberIndex < displayedNumbers.length ? (
            <>
              <h2>{displayedNumbers[currentNumberIndex]}</h2>
              <div className="number-images-container">
                {renderNumberImages(displayedNumbers[currentNumberIndex])}
              </div>
              <h4>Time Remaining: {timer}s</h4>
              <button onClick={handleFingerCountSubmission}>Submit Finger Count</button>
              {isCorrect !== null && (
                <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? "Correct!" : "Incorrect!"}
                </div>
              )}
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="streak-counter">
                Streak: {streak} {streak >= 3 && "🔥"}
              </div>
              <div className="badges">
                {badges.map((badge, index) => (
                  <span key={index} className="badge">{badge}</span>
                ))}
              </div>
              <div className="motivational-feedback">
                <h3>Feedback:</h3>
                <p>{feedback}</p>
              </div>
            </>
          ) : (
            <h2>Game Over! All numbers processed.</h2>
          )}
        </div>
        <div className="right-section">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={500}
            height={400}
          />
          <div className="sticker-container">
            <h3>Stickers Earned:</h3>
            <div className="sticker-row">
              {stickers.map((sticker, index) => (
                <img key={index} src={stickerImages[sticker]} alt={sticker} className="sticker" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showResultsPopup && sessionResults && (
        <div className="results-popup">
          <div className="results-popup-content">
            <h2>Session Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Finger Count</th>
                  <th>Status</th>
                  <th>Time Taken (s)</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {sessionResults.number_data.map((result, index) => (
                  <tr key={index}>
                    <td>{result.displayed_number}</td>
                    <td>{result.finger_count.join(", ")}</td>
                    <td>{result.status.join(", ")}</td>
                    <td>{result.time_taken.join(", ")}</td>
                    <td>{result.attempt_count_per_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={closeResultsPopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FingerCountingGame;