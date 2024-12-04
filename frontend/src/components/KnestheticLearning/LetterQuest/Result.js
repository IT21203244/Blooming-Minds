import React, { useEffect, useState } from "react";

function Result() {
    // Retrieve data from localStorage
    const actualProgress = parseInt(localStorage.getItem("actualProgress")) || 0;
    const timeSpent = parseInt(localStorage.getItem("timeSpent")) || 0;
    const randomImageName = localStorage.getItem("randomImageName");
    const randomImageSrc = localStorage.getItem("randomImageSrc");
    const userEnteredWord = localStorage.getItem("userEnteredWord");

    // Determine the color based on the progress percentage
    const getColor = () => {
        if (actualProgress >= 80) {
            return "#4a90e2"; // Blue for 80% or above
        } else if (actualProgress >= 50) {
            return "green"; // Green for 50% or above
        } else {
            return "red"; // Red for less than 50%
        }
    };

    const handleSaveRecord = () => {
        // Save the data to local storage (again for other potential uses)
        localStorage.setItem("actualProgress", actualProgress);
        localStorage.setItem("randomImageName", randomImageName);
        localStorage.setItem("timeSpent", timeSpent);
        window.location.href = '/saveRecordLetter'; // Redirect to save record page
    };

    return (
        <div>
            <div>
                <p className="topic_pro">Your Progress</p>
                <div className="result_container">
                    <div className="new_boc">
                        <div>
                            <p className="topic_train">Result Details</p>
                            <div className="data_set_mainone">
                                <div
                                    className="progress_circle"
                                    style={{
                                        background: `conic-gradient(${getColor()} ${actualProgress}%, #e0e0e0 ${actualProgress}%)`,
                                    }}
                                >
                                    <span className="progress_text">{actualProgress}%</span>
                                </div>
                                <button className="save_btn" onClick={handleSaveRecord}>Save Record</button>
                                <button className="next_btn" onClick={() => (window.location.href = '/LetterQuest')}>Next Task</button>
                            </div>
                        </div>
                    </div>
                    <div className="resalt_second_container">
                        <p className="topic_train">Task Details</p>
                        <div className="result_image">
                            <p className="matchname">{randomImageName}</p>
                            <p className="user_entered_word">You Entered Word : {userEnteredWord || 'Not Entered'}</p> 
                            {randomImageSrc && <img src={randomImageSrc} alt={randomImageName} className="image_resalt" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Result;
