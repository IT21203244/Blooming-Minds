import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook for routing
import Logout from './img/logout.png';
import Sad from './img/sad.png';
import WinImage from './img/win.png';
import './letter.css';
import Clap from './Taskimg/clap.jpg';
import Cry from './Taskimg/cry.jpg';
import Smile from './Taskimg/smile.jpg';
import Jump from './Taskimg/jump.jpg';
import Run from './Taskimg/run.jpg';
import Think from './Taskimg/think.jpg';
import Dance from './Taskimg/dance.jpg';
import Drink from './Taskimg/Drink.jpg';
import Eat from './Taskimg/eat.jpg';
import Sing from './Taskimg/Sing.jpg';
import Sleep from './Taskimg/Sleep.jpg';
import Angry from './Taskimg/Angry.jpeg';

function LetterQuest() {
    const navigate = useNavigate();  // Hook for navigation
    const images = [
        { name: 'Clap', src: Clap },
        { name: 'Cry', src: Cry },
        { name: 'Think', src: Think },
        { name: 'Jump', src: Jump },
        { name: 'Run', src: Run },
        { name: 'Smile', src: Smile },
        { name: 'Dance', src: Dance },
        { name: 'Drink', src: Drink },
        { name: 'Eat', src: Eat },
        { name: 'Sing', src: Sing },
        { name: 'Sleep', src: Sleep },
        { name: 'Angry', src: Angry },
    ];

    const [randomImage, setRandomImage] = useState(images[0]);
    const [timeLeft, setTimeLeft] = useState(60);
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

    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    };

    useEffect(() => {
        const randomImage = getRandomImage();
        setRandomImage(randomImage);
        setWordToGuess(randomImage.name.toUpperCase());
        setRandomLetters(generateRandomLetters(randomImage.name.toUpperCase()));
        setStartTime(new Date().getTime());  // Set start time when the game starts
    }, []);

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
    }, [timeLeft]);

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

        // Navigate to the result page
        navigate('/result');
    };



    // Function to calculate time spent
    const calculateTimeSpent = () => {
        if (!startTime) return 0;
        return Math.floor((new Date().getTime() - startTime) / 1000);  // Return time in seconds
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

                        <img src={randomImage.src} alt={randomImage.name} className='letter_img' />
                    </div>
                    <div className='letter_table'>
                        <div>
                            <div className="clicked_letters">
                                <p>{clickedLetters}</p>
                            </div>
                            <div>
                                <div className='leter_main_box'>
                                    {randomLetters.map((row, rowIndex) => (
                                        <div className='letter_board' key={rowIndex}>
                                            {row.map((letter, colIndex) => (
                                                <div
                                                    key={colIndex}
                                                    className='letter_cell'
                                                    onClick={() => handleLetterClick(letter)}
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
                                    {handleGameOver()}
                                </div>
                            </div>
                        )}

                        {isGameOver && !isCorrectGuess && (
                            <div className="correct_guess_modal">
                                <div className="correct_guess_modal_content">
                                    <p className="correct_guess">
                                        {timeLeft === 0 ? "Time's Up! Try Again!" : "Oh no, try again!"}
                                    </p>
                                    <img src={Sad} className='win_image' alt='sad' />
                                    <br />
                                    {handleGameOver()}
                                </div>
                            </div>
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
