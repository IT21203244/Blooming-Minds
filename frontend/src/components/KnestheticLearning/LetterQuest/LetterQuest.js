import React, { useState, useEffect } from 'react';
import Clap from './img/clap.jpg';
import Cry from './img/cry.jpg';
import Smile from './img/smile.jpg';
import WinImage from './img/win.png';
import './letter.css'
function LetterQuest() {
    // Image and name data
    const images = [
        { name: 'Clap', src: Clap },
        { name: 'Cry', src: Cry },
        { name: 'Smile', src: Smile }
    ];

    // State to store the randomly selected image and name
    const [randomImage, setRandomImage] = useState(images[0]);
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown
    const [randomLetters, setRandomLetters] = useState([]);
    const [clickedLetters, setClickedLetters] = useState([]);
    const [wordToGuess, setWordToGuess] = useState('');

    // Function to generate a shuffled alphabet and fill the grid
    // Function to generate a shuffled alphabet and fill the grid
    const generateRandomLetters = (word) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const gridSize = 6 * 6; // 6x6 grid = 36 letters
        let grid = Array(gridSize).fill(null); // Start with an empty grid

        // Shuffle the alphabet
        const shuffledAlphabet = alphabet.split('').sort(() => Math.random() - 0.5);

        // Place the word in random positions in the grid
        const wordArr = word.split('');
        wordArr.forEach((letter, index) => {
            const randomIndex = Math.floor(Math.random() * gridSize);
            grid[randomIndex] = letter;
        });

        // Fill the remaining empty spots with shuffled alphabet letters
        let alphabetIndex = 0;
        for (let i = 0; i < grid.length; i++) {
            if (grid[i] === null) {
                grid[i] = shuffledAlphabet[alphabetIndex];
                alphabetIndex++;
                if (alphabetIndex >= shuffledAlphabet.length) {
                    alphabetIndex = 0; // Reset index if we've used all alphabet letters
                }
            }
        }

        // Shuffle the grid to distribute the word letters randomly
        grid = grid.sort(() => Math.random() - 0.5);

        // Convert the grid into a 2D array (6x6)
        const letters = [];
        for (let i = 0; i < 6; i++) {
            letters.push(grid.slice(i * 6, (i + 1) * 6));
        }
        return letters;
    };


    // Function to randomly select an image and name
    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    };

    // Set random image, letters, and word to guess on initial render
    useEffect(() => {
        const randomImage = getRandomImage();
        setRandomImage(randomImage);
        setWordToGuess(randomImage.name.toUpperCase()); // Set word to guess based on selected image
        setRandomLetters(generateRandomLetters(randomImage.name.toUpperCase())); // Generate grid with word
    }, []);

    // Countdown timer effect
    useEffect(() => {
        if (timeLeft === 0) return; // Stop the countdown when time reaches 0
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer); // Stop timer at 0
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Cleanup timer on component unmount
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Function to handle letter click
    const handleLetterClick = (letter) => {
        if (clickedLetters.length < wordToGuess.length) {
            setClickedLetters(prevClicked => [...prevClicked, letter]);
        }
    };

    // Check if the guessed letters match the word
    const isCorrectGuess = clickedLetters.join('') === wordToGuess;

    return (
        <div className='main_continer'>
            <div>
                <p className='main_topic'>Letter Quest</p>
                <div className='letter_continer'>

                    <div className='letter_card'>
                        <p className='letter_name'>{randomImage.name}</p>
                        <p
                            className='time_cpunt'
                            style={{ color: timeLeft <= 10 ? 'red' : '#2b69b2' }} // Red when 10 seconds or less
                        >
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} Minutes Left
                        </p>
                        <img src={randomImage.src} alt={randomImage.name} className='letter_img' />
                    </div>
                    <div className='letter_table'>
                        {/* Random Letter Table */}
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
                        {/* Check if user guessed the correct word */}
                        {isCorrectGuess && (
                            <div className="correct_guess_modal">
                                <div className="correct_guess_modal_content">
                                    <p className="correct_guess">
                                        Congratulation You Win !
                                    </p>
                                    <img src={WinImage} className='win_image' alt='winnn' />
                                    <br />
                                    <div>
                                        <button className="nextstep" onClick={() => window.location.reload()}>Next Step</button>
                                        <button className="nextstep" onClick={() => window.location.reload()}>Go Home</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {clickedLetters.length === wordToGuess.length && !isCorrectGuess && (
                            <p className='incorrect_guess' style={{ color: 'red' }}>
                                Incorrect guess! Try again.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LetterQuest;
