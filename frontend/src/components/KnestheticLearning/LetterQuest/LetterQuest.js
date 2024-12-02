import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook for routing
import Clap from './img/clap.jpg';
import Cry from './img/cry.jpg';
import Smile from './img/smile.jpg';
import WinImage from './img/win.png';
import Sad from './img/sad.png';
import './letter.css';

function LetterQuest() {
    const navigate = useNavigate();  // Hook for navigation
    const images = [
        { name: 'Clap', src: Clap },
        { name: 'Cry', src: Cry },
        { name: 'Smile', src: Smile }
    ];

    const [randomImage, setRandomImage] = useState(images[0]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [randomLetters, setRandomLetters] = useState([]);
    const [clickedLetters, setClickedLetters] = useState([]);
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
        if (clickedLetters.length < wordToGuess.length) {
            setClickedLetters(prevClicked => [...prevClicked, letter]);
        }
    };

    const isCorrectGuess = clickedLetters.join('') === wordToGuess;
    const isGameOver = timeLeft === 0 || (clickedLetters.length === wordToGuess.length && !isCorrectGuess);

    // Function to calculate time spent and remaining time
    const calculateTimeSpent = () => {
        if (!startTime) return 0;
        return Math.floor((new Date().getTime() - startTime) / 1000);  // Return time in seconds
    };

    const calculateProgress = () => {
        const timeSpent = calculateTimeSpent();
        const totalTime = 60; // Total time available is 60 seconds
        const progress = Math.min((timeSpent / totalTime) * 100, 100);  // Ensure progress doesn't exceed 100%
        return Math.floor(progress);
    };

    const handleGameOver = () => {
        // Collect game progress data
        const timeSpent = calculateTimeSpent();
        const remainingTime = timeLeft;
        const progress = calculateProgress();
    
        // Navigate to the result page with the progress data and image info
        navigate('/result', { state: { 
            timeSpent, 
            remainingTime, 
            progress, 
            randomImageName: randomImage.name,  // Pass the image name
            randomImageSrc: randomImage.src     // Pass the image source
        } });
    };
    

    return (
        <div className='main_continer'>
            <div>
                <p className='main_topic'>Letter Quest</p>
                <div className='letter_continer'>
                    <div className='letter_card'>
                        <p className='letter_name'>{randomImage.name}</p>
                        <p className='time_cpunt' style={{ color: timeLeft <= 10 ? 'red' : '#2b69b2' }}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} Minutes Left
                        </p>
                        <img src={randomImage.src} alt={randomImage.name} className='letter_img' />
                    </div>
                    <div className='letter_table'>
                        <div>
                            <div className="clicked_letters">
                                <p>{clickedLetters.join(' ')}</p>
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

                        {isGameOver && (
                            <div className="correct_guess_modal">
                                <div className="correct_guess_modal_content">
                                    <p className="correct_guess">
                                        {timeLeft === 0 ? "Time's Up! Try Again!" : "Oh no, try again!"}
                                    </p>
                                    <img src={Sad} className='win_image' alt='sad' />
                                    <br />
                                    <button className='try_btn' onClick={() => window.location.reload()}>
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LetterQuest;
