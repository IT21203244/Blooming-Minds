import React from 'react';
import { useLocation } from 'react-router-dom';
// import './result.css';

function Result() {
    const { state } = useLocation();
    const { timeSpent = 0, remainingTime = 0, totaltime = 60 } = state || {}; // Handle default values and undefined state

    // Prevent division by zero and ensure progress calculation is valid
    const progress = timeSpent > 0 ? ((totaltime - remainingTime) / totaltime) * 100 : 0;

    return (
        <div className="result_container">
            <h2>Your Progress</h2>
            <div className="result_data">
                <p><strong>Time Spent:</strong> {timeSpent} seconds</p>
                <p><strong>Remaining Time:</strong> {remainingTime} seconds</p>
                <p><strong>Progress:</strong> {progress.toFixed(2)}%</p>
            </div>
            <div className="button_container">
                <button onClick={() => window.location.reload()} className="restart_btn">
                    Play Again
                </button>
            </div>
        </div>
    );
}

export default Result;
