import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./MathLearningGame.css";

// Multiple images for visual representations
import apple from "./img/ac.png";
import banana from "./img/bc.png";
import orange from "./img/oc.png";
import strawberry from "./img/sc.png";
import watermelon from "./img/wc.png";
import grapes from "./img/gc.png";
import milk from "./img/fmc.png";
import cupcake from "./img/cc.png";
import choco from "./img/chc.png";
import icecream from "./img/ic.png";
import donut from "./img/dc.png";
import marsh from "./img/mc.png";

const MathLearningGame = () => {
  const { level } = useParams();
  const [userId, setUserId] = useState(null);
  const [problem, setProblem] = useState(null);
  const [num1, setNum1] = useState(null);
  const [num2, setNum2] = useState(null);
  const [concept, setConcept] = useState("addition"); // Default concept
  const [userAnswer, setUserAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [firstNumber, setFirstNumber] = useState(null);
  const [secondNumber, setSecondNumber] = useState(null);
  const [timeTakenFirst, setTimeTakenFirst] = useState(null);
  const [timeTakenSecond, setTimeTakenSecond] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState(null); // State for recommended level
  const [image1, setImage1] = useState(apple);
  const [image2, setImage2] = useState(banana);
  const [combinedResultOptions, setCombinedResultOptions] = useState([]);
  const [selectedCombinedResult, setSelectedCombinedResult] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null); // State to store the correct answer
  const [isCombinedResultCorrect, setIsCombinedResultCorrect] = useState(null); // State for combined result correctness

  // Array of available images
  const images = [apple, banana, orange, strawberry, watermelon, grapes, milk, cupcake, choco, icecream, donut, marsh];

  // Difficulty ranges per level
  const DIFFICULTY_RANGES = {
    easy: { min: 1, max: 10 },
    medium: { min: 1, max: 30 },
    hard: { min: 10, max: 60 },
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const user = JSON.parse(atob(token.split(".")[1]));
      setUserId(user.user_id);
    } else {
      alert("User is not authenticated. Please log in.");
    }
    generateProblem();
  }, [concept, level]);

  // Function to get a random image from the images array
  const getRandomImage = () => {
    return images[Math.floor(Math.random() * images.length)];
  };

  const generateProblem = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/visual_learning/math_learning/generate_problem?concept=${concept}&level=${level}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setProblem(response.data.problem);
      setNum1(response.data.num1);
      setNum2(response.data.num2);
      setCorrectAnswer(response.data.correct_answer); // Store the correct answer
      setStartTime(Date.now());

      // Set random images for the numbers
      setImage1(getRandomImage());
      setImage2(getRandomImage());
    } catch (error) {
      console.error("Error generating problem:", error);
    }
  };

  const handleNumberSelection = async (selectedNumber, isFirstNumber) => {
    const currentTime = Date.now();
    const timeTaken = (currentTime - startTime) / 1000; // Convert to seconds

    if (isFirstNumber) {
      setFirstNumber(selectedNumber);
      setTimeTakenFirst(timeTaken);
    } else {
      setSecondNumber(selectedNumber);
      setTimeTakenSecond(timeTaken);

      // Calculate user answer based on the concept
      let userAnswer;
      switch (concept) {
        case "addition":
          userAnswer = firstNumber + selectedNumber;
          break;
        case "subtraction":
          userAnswer = firstNumber - selectedNumber;
          break;
        case "multiplication":
          userAnswer = firstNumber * selectedNumber;
          break;
        case "division":
          userAnswer = firstNumber / selectedNumber;
          break;
        default:
          userAnswer = 0;
      }
      setUserAnswer(userAnswer);

      // Generate combined result options
      const incorrectOptions = generateIncorrectOptions(correctAnswer);
      setCombinedResultOptions(shuffleArray([correctAnswer, ...incorrectOptions]));

      // Show popup and animation
      setShowAnimation(true);
      setShowPopup(true);
    }
  };

  const generateIncorrectOptions = (correctResult) => {
    const incorrectOptions = [];
    while (incorrectOptions.length < 2) {
      const randomOption = correctResult + Math.floor(Math.random() * 10) - 5;
      if (randomOption !== correctResult && !incorrectOptions.includes(randomOption)) {
        incorrectOptions.push(randomOption);
      }
    }
    return incorrectOptions;
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleCombinedResultSelection = async (selectedResult) => {
    setSelectedCombinedResult(selectedResult);

    // Check if the selected result is correct
    const isCombinedCorrect = selectedResult === correctAnswer;
    setIsCombinedResultCorrect(isCombinedCorrect);

    // Submit answer and combined result to backend
    try {
      const response = await axios.post(
        "http://localhost:5000/visual_learning/math_learning/submit_answer",
        {
          user_id: userId,
          concept: concept,
          problem: problem,
          user_answer: userAnswer,
          correct_answer: correctAnswer,
          level: level,
          first_number: firstNumber,
          second_number: secondNumber,
          time_taken_first: timeTakenFirst,
          time_taken_second: timeTakenSecond,
          combined_result: selectedResult,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setIsCorrect(response.data.is_correct);
      setRecommendedLevel(response.data.new_level); // Set recommended level from response
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // Render visual representations for numbers
  const renderVisualRepresentation = (number, image) => {
    return Array(Math.abs(number)) // Use absolute value for rendering images
      .fill()
      .map((_, index) => (
        <img key={index} src={image} alt="Visual representation" className="sv-visual-image" />
      ));
  };

  // Close the popup and load the next problem
  const closePopup = () => {
    setShowPopup(false);
    setShowAnimation(false);
    generateProblem(); // Load the next problem
    setIsCorrect(null);
    setFirstNumber(null);
    setSecondNumber(null);
    setRecommendedLevel(null); // Reset recommended level
    setSelectedCombinedResult(null);
    setIsCombinedResultCorrect(null); // Reset combined result correctness
  };

  // Handle concept change
  const handleConceptChange = (selectedConcept) => {
    setConcept(selectedConcept);
    setFirstNumber(null);
    setSecondNumber(null);
    setIsCorrect(null);
    setShowPopup(false);
    setShowAnimation(false);
    setRecommendedLevel(null); // Reset recommended level
  };

  // Calculate combined result based on the concept
  const calculateCombinedResult = () => {
    switch (concept) {
      case "addition":
        return firstNumber + secondNumber;
      case "subtraction":
        return firstNumber - secondNumber;
      case "multiplication":
        return firstNumber * secondNumber;
      case "division":
        return firstNumber / secondNumber;
      default:
        return 0;
    }
  };

  const renderResultVisualization = () => {
    const result = calculateCombinedResult();
    const absoluteResult = Math.abs(result);
    
    switch (concept) {
      case "addition":
        return (
          <>
            {renderVisualRepresentation(firstNumber, image1)}
            {renderVisualRepresentation(secondNumber, image2)}
          </>
        );
      case "subtraction":
      case "multiplication":
      case "division":
        return (
          <div className="sv-result-representation">
            {renderVisualRepresentation(absoluteResult, image1)}
            {result < 0 && <span className="sv-negative-sign">-</span>}
          </div>
        );
      default:
        return null;
    }
  };

  // Get the range of numbers based on the current level
  const getNumberRange = () => {
    const { min, max } = DIFFICULTY_RANGES[level] || { min: 1, max: 10 }; // Default to easy if level is invalid
    return { min, max };
  };

  return (
    <div className="sv-math-learning-game">
      <h1>Math Marvels</h1>

      {/* Concept selection buttons */}
      <div className="sv-concept-buttons">
        <button
          className={concept === "addition" ? "active" : ""}
          onClick={() => handleConceptChange("addition")}
        >
          Addition
        </button>
        <button
          className={concept === "subtraction" ? "active" : ""}
          onClick={() => handleConceptChange("subtraction")}
        >
          Subtraction
        </button>
        <button
          className={concept === "multiplication" ? "active" : ""}
          onClick={() => handleConceptChange("multiplication")}
        >
          Multiplication
        </button>
        <button
          className={concept === "division" ? "active" : ""}
          onClick={() => handleConceptChange("division")}
        >
          Division
        </button>
      </div>

      {/* Visual representations */}
      <div className="sv-visual-representations">
        <div className="sv-visual-group">
          <p>Count for the First Number</p>
          <div className="sv-images-container">
            {renderVisualRepresentation(num1, image1)}
          </div>
          {/* Number cards for the first number */}
          <div className="sv-number-cards">
            {Array.from(
              { length: getNumberRange().max - getNumberRange().min + 1 },
              (_, i) => i + getNumberRange().min
            ).map((number) => (
              <button
                key={number}
                onClick={() => handleNumberSelection(number, true)}
                disabled={firstNumber !== null}
              >
                {number}
              </button>
            ))}
          </div>
        </div>
        <div className="sv-operator">
          {problem && problem.split(" ")[1]} {/* Display only the operator */}
        </div>
        <div className="sv-visual-group">
          <p>Count for the Second Number</p>
          <div className="sv-images-container">
            {renderVisualRepresentation(num2, image2)}
          </div>
          {/* Number cards for the second number */}
          <div className="sv-number-cards">
            {Array.from(
              { length: getNumberRange().max - getNumberRange().min + 1 },
              (_, i) => i + getNumberRange().min
            ).map((number) => (
              <button
                key={number}
                onClick={() => handleNumberSelection(number, false)}
                disabled={secondNumber !== null}
              >
                {number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popup for Feedback, Animation, and Combined Result Selection */}
      {showPopup && (
        <div className="sv-popup-overlay">
          <div className="sv-popup-content">
            <button className="sv-popup-close" onClick={closePopup}>
              &times;
            </button>
            {/* Feedback */}
            {isCorrect !== null && (
              <div className={`sv-feedback ${isCorrect ? "sv-correct" : "sv-incorrect"}`}>
                {isCorrect ? "Correct!" : "Incorrect!"}
              </div>
            )}
            {/* Animation */}
            {showAnimation && (
              <div className="sv-animation">
                <div className="sv-combine-animation">
                  {renderResultVisualization()}
                </div>
              </div>
            )}
            {/* Combined Result Selection */}
            {combinedResultOptions.length > 0 && (
              <div className="sv-combined-result-selection">
                <h3>Choose the Correct Combined Result:</h3>
                <div className="sv-combined-result-options">
                  {combinedResultOptions.map((option, index) => (
                    <button
                      key={index}
                      className={`sv-combined-result-option ${
                        selectedCombinedResult === option ? "selected" : ""
                      }`}
                      onClick={() => handleCombinedResultSelection(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {/* Combined Result Feedback */}
                {isCombinedResultCorrect !== null && (
                  <div className={`sv-feedback ${isCombinedResultCorrect ? "sv-correct" : "sv-incorrect"}`}>
                    {isCombinedResultCorrect ? "Correct!" : "Incorrect!"}
                  </div>
                )}
              </div>
            )}
            {/* Time taken */}
            {firstNumber !== null && secondNumber !== null && (
              <div className="sv-number-selection">
                <p>First Number: {firstNumber} (Time: {timeTakenFirst.toFixed(2)}s)</p>
                <p>Second Number: {secondNumber} (Time: {timeTakenSecond.toFixed(2)}s)</p>
              </div>
            )}
            {/* Recommended Level */}
            {recommendedLevel && (
              <div className="sv-recommended-level">
                <p>Recommended Level: {recommendedLevel.charAt(0).toUpperCase() + recommendedLevel.slice(1)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathLearningGame;