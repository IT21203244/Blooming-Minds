import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook for routing
import Logout from './img/logout.png';
import Sad from './img/sad.png';
import WinImage from './img/win.png';
import './letter.css';
import { FaDeleteLeft } from "react-icons/fa6";
function LetterQuest() {
    const [attempts, setAttempts] = useState(1); // Track the number of attempts
    const [hintsToShow, setHintsToShow] = useState(1); // Track the number of hints to display
    const [showTryAgain, setShowTryAgain] = useState(false); // Track if "Try Again" button should be shown
    const navigate = useNavigate();  // Hook for navigation
    const images = [
        { name: 'CLAP', points: [`First letter is C, last letter is P, and it has 4 letters`, "Used to show appreciation", "Done with hands", "Makes a sound"] },
        { name: 'CRY', points: [`First letter is C, last letter is Y, and it has 3 letters`, "Happens when sad", "Tears come out", "Expresses emotions"] },
        { name: 'THINK', points: [`First letter is T, last letter is K, and it has 5 letters`, "Uses the brain", "Helps solve problems", "Done before making decisions"] },
        { name: 'JUMP', points: [`First letter is J, last letter is P, and it has 4 letters`, "Done with legs", "Goes up and down", "Used in sports"] },
        { name: 'RUN', points: [`First letter is R, last letter is N, and it has 3 letters`, "Faster than walking", "Requires stamina", "Common in races"] },
        { name: 'SMILE', points: [`First letter is S, last letter is E, and it has 5 letters`, "Expresses happiness", "Done with mouth", "Seen when joyful"] },
        { name: 'DANCE', points: [`First letter is D, last letter is E, and it has 5 letters`, "Done with body", "Rhythmic movement", "Enjoyed with music"] },
        { name: 'DRINK', points: [`First letter is D, last letter is K, and it has 5 letters`, "Used to quench thirst", "Involves a liquid", "Done with mouth"] },
        { name: 'EAT', points: [`First letter is E, last letter is T, and it has 3 letters`, "Done when hungry", "Involves food", "Uses mouth and teeth"] },
        { name: 'SING', points: [`First letter is S, last letter is G, and it has 4 letters`, "Uses the voice", "Involves melody", "Done in concerts"] },
        { name: 'SLEEP', points: [`First letter is S, last letter is P, and it has 5 letters`, "Rest for the body", "Done at night", "Requires a bed"] },
        { name: 'ANGRY', points: [`First letter is A, last letter is Y, and it has 5 letters`, "Strong emotion", "Causes frustration", "Seen on the face"] },
    ];
    const [randomImage, setRandomImage] = useState(images[0]);
    const [timeLeft, setTimeLeft] = useState(10);
    const [randomLetters, setRandomLetters] = useState([]);
    const [clickedLetters, setClickedLetters] = useState('');
    const [wordToGuess, setWordToGuess] = useState('');
    const [startTime, setStartTime] = useState(null);  // Track start time of the game

    const generateRandomLetters = (word) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const gridSize = 6 * 6;
        let grid = Array(gridSize).fill(null);

        const shuffledAlphabet = alphabet.split('').sort(() => Math.random() - 0.5);

        const wordArr = word.split('');
        wordArr.forEach((letter, index) => {
            const randomIndex = Math.floor(Math.random() * gridSize);
            grid[randomIndex] = letter;
        });

        let alphabetIndex = 0;
        for (let i = 0; i < grid.length; i++) {
            if (grid[i] === null) {
                grid[i] = shuffledAlphabet[alphabetIndex];
                alphabetIndex++;
                if (alphabetIndex >= shuffledAlphabet.length) {
                    alphabetIndex = 0;
                }
            }
        }

        grid = grid.sort(() => Math.random() - 0.5);

        const letters = [];
        for (let i = 0; i < 6; i++) {
            letters.push(grid.slice(i * 6, (i + 1) * 6));
        }
        return letters;
    };

    useEffect(() => {
        const getRandomImage = async () => {
            const username = localStorage.getItem("userName");
            const completedTasks = await fetchCompletedTasks(username);

            // Filter out tasks that have already been completed
            const availableImages = images.filter(img => !completedTasks.includes(img.name));

            if (availableImages.length === 0) return null; // If all tasks are completed, return null

            const randomIndex = Math.floor(Math.random() * availableImages.length);
            return availableImages[randomIndex] || null; // Return null if no valid selection
        };

        getRandomImage().then((randomImg) => {
            if (randomImg && randomImg.name) {
                setRandomImage(randomImg);
                setWordToGuess(randomImg.name);  // No need for .toUpperCase() here
                setRandomLetters(generateRandomLetters(randomImg.name));  // No need for .toUpperCase() here
            } else {
                console.log("No available tasks to display.");
                setRandomImage(null);
                setWordToGuess("");
            }
        });
    }, []);

    useEffect(() => {
        if (randomImage && randomImage.name) {
            setRandomImage(randomImage);
            setWordToGuess(randomImage.name.toUpperCase());
            setRandomLetters(generateRandomLetters(randomImage.name.toUpperCase()));
            setStartTime(new Date().getTime());
            setAttempts(1); // Reset attempts
            setHintsToShow(2); // Show first 2 hints at the start
            setShowTryAgain(false); // Hide "Try Again" button
        }
    }, [randomImage]);

    useEffect(() => {
        if (timeLeft === 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]); // Add `timeLeft` as a dependency

    const handleLetterClick = (letter) => {
        setClickedLetters((prevClicked) => prevClicked + letter);  // Add the clicked letter to the string
    };

    const calculateProgress = () => {
        const correctCount = [...clickedLetters].filter((letter, index) => letter === wordToGuess[index]).length;
        return (correctCount / wordToGuess.length) * 100;
    };

    const isCorrectGuess = clickedLetters === wordToGuess;
    const isGameOver = timeLeft === 0 || isCorrectGuess;

    const handleGameOver = () => {
        // Calculate progress and time spent
        const progress = calculateProgress();
        const timeSpent = calculateTimeSpent();

        // Get current date and time in local time (formatted as HH:mm AM/PM)
        const localTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Save the data to localStorage
        localStorage.setItem("actualProgress", progress);
        localStorage.setItem("timeSpent", timeSpent);
        localStorage.setItem("randomImageName", randomImage.name);  // Save the image name
        localStorage.setItem("randomImageSrc", randomImage.src);    // Save the image source
        localStorage.setItem("userEnteredWord", clickedLetters);    // Save the user-entered word
        localStorage.setItem("taskCompletionTime", localTime); // Save the local task completion time
        localStorage.setItem("attempts", attempts);
        // Determine the user's level based on the number of hints shown
        let userLevel;
        if (hintsToShow === 1) {
            userLevel = "Level 1"; // User completed the task with 1 hint
        } else if (hintsToShow === 2) {
            userLevel = "Level 2"; // User completed the task with 2 hints
        } else if (hintsToShow === 3) {
            userLevel = "Level 3"; // User completed the task with 3 hints
        }

        // Save the user's level to localStorage
        localStorage.setItem("UserLevel", userLevel);

        // Navigate to the result page only if progress is 100%
        if (progress === 100) {
            navigate('/result');
        } else {
            setShowTryAgain(true);
        }
    };

    useEffect(() => {
        if (isGameOver) {
            handleGameOver();
        }
    }, [isGameOver]); // Add dependencies to avoid unnecessary re-renders

    const fetchCompletedTasks = async (username) => {
        try {
            const response = await fetch(`/getCompletedTasks/${username}`);
            const data = await response.json();
            return data.completed_tasks || [];
        } catch (error) {
            console.error("Error fetching completed tasks:", error);
            return [];
        }
    };

    // Function to calculate time spent
    const calculateTimeSpent = () => {
        if (!startTime) return 0;
        return Math.floor((new Date().getTime() - startTime) / 1000);  // Return time in seconds
    };

    const handleTryAgain = () => {
        setAttempts(attempts + 1); // Increment attempts

        // Update hintsToShow based on the number of attempts
        if (attempts === 1) {
            setHintsToShow(3); // Show first 3 hints on the second attempt
        } else if (attempts >= 2) {
            setHintsToShow(randomImage.points.length); // Show all hints on subsequent attempts
        }

        setClickedLetters(''); // Reset clicked letters
        setTimeLeft(10); // Reset the timer to 60 seconds
        setShowTryAgain(false); // Hide the "Try Again" button
    };
    const handleClearLetter = () => {
        if (clickedLetters.length > 0) {
            setClickedLetters((prevClicked) => prevClicked.slice(0, -1)); // Remove the last letter
        }
    };
    return (
        <div className='main_continer'>
            <div>
                <p className='main_topic'>Letter Quest</p>
                <div className='letter_continer'>
                    <div className='letter_card'>
                        <p className='letter_name'>{randomImage.name}</p>
                        <div>
                            <p className='time_cpunt' style={{ color: timeLeft <= 10 ? 'red' : '#2b69b2' }}>
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} Minutes Left
                            </p>
                            <div className="time_progress_bar">
                                <div
                                    className="time_progress_fill"
                                    style={{
                                        width: `${(timeLeft / 60) * 100}%`, // Calculate width based on remaining time
                                        backgroundColor: timeLeft <= 10 ? 'red' : '#2b69b2', // Change color dynamically
                                        transition: 'width 0.5s ease', // Smooth transition for width changes
                                    }}
                                ></div>
                            </div>
                        </div>
                        <p className='point_section'>
                            {randomImage.points.slice(0, hintsToShow).map((point, index) => (
                                <p className='point_txt' key={index}>▪️{point}</p>  // Display only the first `hintsToShow` points
                            ))}
                        </p>

                    </div>
                    <div className='letter_table'>
                        <div className="attempts_section">
                            <p className="attempts_section_lbl">Attempts: {attempts}</p>
                        </div>
                        <div>
                            <div className="clicked_letterscon">
                                <p className='clicked_letters'>{clickedLetters}</p>
                                {clickedLetters.length > 0 && (
                                    <FaDeleteLeft onClick={handleClearLetter} className="clear_letter_btn" />

                                )}
                            </div>
                            <div>
                                <div className='leter_main_box'>
                                    {randomLetters.map((row, rowIndex) => (
                                        <div className='letter_board' key={rowIndex}>
                                            {row.map((letter, colIndex) => (
                                                <div
                                                    key={colIndex}
                                                    className='letter_cell'
                                                    onClick={!showTryAgain ? () => handleLetterClick(letter) : undefined} // Disable click if showTryAgain is true
                                                    style={{ cursor: showTryAgain ? 'not-allowed' : 'pointer' }} // Change cursor style
                                                >
                                                    {letter}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                        <div className="progress_container_word">
                            <p>Progress: {Math.floor(calculateProgress())}%</p>
                        </div>
                        {isCorrectGuess && (
                            <div className="correct_guess_modal">
                                <div className="correct_guess_modal_content">
                                    <p className="correct_guess">Congratulations! You Win!</p>
                                    <img src={WinImage} className='win_image' alt='win' />
                                    <br />
                                </div>
                            </div>
                        )}

                        {isGameOver && !isCorrectGuess && (
                            <button className="try_again_btn" onClick={handleTryAgain}>
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className='admin_btn' onClick={() => (window.location.href = '/KnestheticHome')}>
                <img src={Logout} alt='admin icon' className='admin_acion' />
            </div>
        </div>
    );
}

export default LetterQuest;