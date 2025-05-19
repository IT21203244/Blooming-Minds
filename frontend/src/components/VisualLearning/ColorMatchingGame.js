import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ColorMatchingGame.css";
import axios from "axios";

// Mapping of reward types to their corresponding image paths
const rewardImages = {
  sticker: "http://localhost:5000/static/images/pandawb.png",
  star: "http://localhost:5000/static/images/smilerbow.png",
  trophy: "http://localhost:5000/static/images/trophy.png",
};

// All possible colors
const ALL_COLORS = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "brown"];

const levelConfig = {
  easy: {
    sequenceLength: 3,
    timeLimit: 10000,
    colorSelectionSize: 4,  // Show 4 colors in selection (including sequence colors)
  },
  medium: {
    sequenceLength: 5,
    timeLimit: 8000,
    colorSelectionSize: 6,  // Show 6 colors in selection (including sequence colors)
  },
  hard: {
    sequenceLength: 7,
    timeLimit: 6000,
    colorSelectionSize: 8,  // Show all colors in selection
  },
};

const ColorMatchingGame = () => {
  const { level } = useParams();
  const [sequence, setSequence] = useState([]);
  const [inputSequence, setInputSequence] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [startDragTime, setStartDragTime] = useState(null);
  const [circleCount, setCircleCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [availableCircles, setAvailableCircles] = useState(10);
  const [recommendedLevel, setRecommendedLevel] = useState(null);
  const [responseTimes, setResponseTimes] = useState([]);
  const [mistakePatterns, setMistakePatterns] = useState({});
  const [streak, setStreak] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [colorData, setColorData] = useState({
    sequence: [],
    colorSelectionSet: ALL_COLORS.slice(0, levelConfig.easy.colorSelectionSize)
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get color selection set based on level and sequence
  const getColorSelectionSet = (sequence, level) => {
    const config = levelConfig[level] || levelConfig.easy;
    const sequenceColors = [...new Set(sequence)]; // Get unique colors from sequence
    
    // If we already have enough colors in the sequence, use them plus random ones
    if (sequenceColors.length >= config.colorSelectionSize) {
      return sequenceColors.slice(0, config.colorSelectionSize);
    }
    
    // Otherwise, add random colors to reach the required size
    const remainingColors = ALL_COLORS.filter(color => !sequenceColors.includes(color));
    const neededColors = config.colorSelectionSize - sequenceColors.length;
    const additionalColors = remainingColors
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, neededColors);
    
    return [...sequenceColors, ...additionalColors];
  };

  // Fetch personalized color suggestions when component mounts
  useEffect(() => {
    const fetchColorSuggestions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(
          `http://localhost:5000/visual_learning/get_color_suggestions?level=${level}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          const sequence = response.data.provided_sequence || [];
          const colorSelectionSet = response.data.color_selection_set || 
            getColorSelectionSet(sequence, level);
          
          setColorData({
            sequence,
            colorSelectionSet
          });
        }
      } catch (error) {
        console.error("Error fetching color suggestions:", error);
      }
    };

    fetchColorSuggestions();
  }, [level]);

  // Initialize game with either personalized suggestions or random colors
  useEffect(() => {
    const initializeGame = () => {
      const config = levelConfig[level] || levelConfig.easy;

      // Use personalized sequence if available, otherwise generate random sequence
      const generatedSequence = colorData.sequence.length > 0
        ? [...colorData.sequence].slice(0, config.sequenceLength)
        : Array.from({ length: config.sequenceLength }, () =>
            ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)]
          );

      // Ensure color selection set includes all sequence colors
      const updatedColorSelectionSet = getColorSelectionSet(generatedSequence, level);

      setSequence(generatedSequence);
      setInputSequence(Array(generatedSequence.length).fill(""));
      setColorData(prev => ({
        ...prev,
        colorSelectionSet: updatedColorSelectionSet
      }));

      const timer = setTimeout(() => {
        setIsHidden(true);
      }, config.timeLimit);

      return () => clearTimeout(timer);
    };

    initializeGame();
  }, [level, colorData.sequence]);

  const handleDropEmptyCircle = (index) => {
    if (availableCircles > 0) {
      const updatedSequence = [...inputSequence];
      updatedSequence[index] = "empty";
      setInputSequence(updatedSequence);
      setCircleCount((prev) => prev + 1);
      setAvailableCircles((prev) => prev - 1);
    }
  };

  const handleDropColor = (color, index) => {
    const updatedSequence = [...inputSequence];
    updatedSequence[index] = color;

    if (!startDragTime) {
      setStartDragTime(Date.now());
    }

    // Track response time
    const responseTime = Date.now() - (startDragTime || Date.now());
    setResponseTimes((prev) => [...prev, responseTime]);

    // Track mistake patterns
    if (color !== sequence[index]) {
      setMistakePatterns((prev) => ({
        ...prev,
        [color]: (prev[color] || 0) + 1,
      }));
    }

    setInputSequence(updatedSequence);
  };

  const handleDone = async () => {
    if (!startDragTime) {
      alert("No actions were performed!");
      return;
    }

    const endTime = Date.now();
    const totalTimeTaken = Math.floor((endTime - startDragTime) / 1000);
    setTimeTaken(totalTimeTaken);

    const correctCount = inputSequence.filter(
      (color, idx) => color === sequence[idx]
    ).length;

    const emptyCircles = inputSequence.filter((color) => color === "").length;
    const wrongCount = sequence.length - correctCount - emptyCircles;

    const totalScore = Math.floor((correctCount / sequence.length) * 100);

    // Calculate streak
    const newStreak = totalScore >= 90 ? streak + 1 : 0;
    setStreak(newStreak);

    const resultData = {
      level,
      wrong_takes: wrongCount + emptyCircles,
      correct_takes: correctCount,
      total_score: totalScore,
      time_taken: totalTimeTaken,
      provided_sequence: sequence,
      child_sequence: inputSequence,
      circle_count: circleCount,
      date: new Date().toISOString(),
      response_times: responseTimes,
      mistake_patterns: mistakePatterns,
      streak: newStreak,
    };

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("User is not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/visual_learning/color_matching_game",
        resultData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setResultData({
          ...resultData,
          result_id: response.data.result_id,
          recommended_level: response.data.recommended_level,
          reward: response.data.reward,
        });

        setFeedback(response.data.message);
        setRecommendedLevel(response.data.recommended_level);

        // Update color data with new suggestions if provided
        if (response.data.provided_sequence || response.data.color_selection_set) {
          const newSequence = response.data.provided_sequence || sequence;
          const newColorSet = response.data.color_selection_set || 
            getColorSelectionSet(newSequence, response.data.recommended_level || level);
          
          setColorData({
            sequence: newSequence,
            colorSelectionSet: newColorSet
          });
        }

        // Fetch rewards
        const rewardsResponse = await axios.get(
          "http://localhost:5000/visual_learning/color_matching_game/rewards",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (rewardsResponse.data?.rewards) {
          setRewards(rewardsResponse.data.rewards);
        }
      } else {
        alert("Failed to save result, please try again.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else {
        alert(
          `Error saving result: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="scmg-color-matching-game">
      <div className="scmg-game-container">
        <h1>Level: {level.toUpperCase()}</h1>


        <div className="scmg-color-sequence">
          {sequence.map((color, index) => (
            <div
              key={index}
              className={`scmg-circle ${isHidden ? "scmg-hidden" : ""}`}
              style={{ backgroundColor: color }}
            ></div>
          ))}
          {isHidden && <div className="scmg-overlay"></div>}
        </div>

        <div className="scmg-drop-zone">
          {Array.from({ length: sequence.length }).map((_, index) => (
            <div
              key={index}
              className="scmg-empty-circle"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const data = e.dataTransfer.getData("type");
                if (data === "empty-circle") {
                  handleDropEmptyCircle(index);
                } else {
                  handleDropColor(data, index);
                }
              }}
            >
              {inputSequence[index] && (
                <div
                  className="scmg-filled-circle"
                  style={{
                    backgroundColor:
                      inputSequence[index] === "empty"
                        ? "lightgray"
                        : inputSequence[index],
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="scmg-color-options">
          {colorData.colorSelectionSet.map((color) => (
            <div
              key={color}
              className="scmg-color-option"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("type", color)}
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>

        <div className="scmg-empty-circle-pool-container">
          <div className="scmg-basket">
            {Array.from({ length: availableCircles }).map((_, index) => (
              <div
                key={index}
                className="scmg-empty-circle"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("type", "empty-circle")
                }
              ></div>
            ))}
          </div>
        </div>

        <button className="scmg-done-button" onClick={handleDone}>
          Done
        </button>

        <div className="scmg-stats-container">
          <div className="scmg-circle-count">
            <h3>Circles Filled: {circleCount}</h3>
          </div>

          {streak > 0 && (
            <div className="scmg-streak">
              <h3>Streak: {streak} in a row!</h3>
            </div>
          )}
        </div>

        {feedback && (
          <div className="scmg-feedback">
            <h3>Feedback</h3>
            <p>{feedback}</p>
          </div>
        )}

        {resultData && (
          <div className="scmg-result-summary">
            <h3>Result Summary</h3>
            <p><strong>Level:</strong> {level}</p>
            <p><strong>Wrong Takes:</strong> {resultData.wrong_takes}</p>
            <p><strong>Correct Takes:</strong> {resultData.correct_takes}</p>
            <p><strong>Total Score:</strong> {resultData.total_score} / 100</p>
            <p><strong>Time Taken:</strong> {resultData.time_taken} seconds</p>
            <p><strong>Circle Count:</strong> {resultData.circle_count}</p>
            {recommendedLevel && (
              <p><strong>Recommended Level:</strong> {recommendedLevel}</p>
            )}
            {resultData.reward && (
              <div className="scmg-reward-earned">
                <p><strong>Reward Earned:</strong></p>
                <img 
                  src={rewardImages[resultData.reward]} 
                  alt={resultData.reward}
                  style={{ width: "50px", height: "50px" }}
                />
              </div>
            )}
          </div>
        )}

        {rewards.length > 0 && (
          <div className="scmg-rewards">
            <h3>Your Reward Collection</h3>
            <div className="scmg-rewards-grid">
              {rewards.map((reward, index) => (
                <div key={index} className="scmg-reward-item">
                  <img
                    src={rewardImages[reward.reward_type]}
                    alt={reward.reward_type}
                  />
                  <span className="scmg-reward-count">x{reward.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorMatchingGame;