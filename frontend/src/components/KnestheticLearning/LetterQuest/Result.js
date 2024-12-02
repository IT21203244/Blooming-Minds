import React from "react";
import { useLocation } from "react-router-dom";

function Result() {
    const { state } = useLocation();
    const { timeSpent = 0, remainingTime = 0, progress = 0, randomImageName, randomImageSrc } = state || {};
    const actualProgress = 100 - progress;

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

    return (
        <div>
            <div>
                <p className="topic_pro">Your Progress</p>
                <div className="result_container">
                    <div className="new_boc">
                        <div>
                            <p className="topic_train">result details</p>
                            <div className="data_set_mainone">
                                <div
                                    className="progress_circle"
                                    style={{
                                        background: `conic-gradient(${getColor()} ${actualProgress}%, #e0e0e0 ${actualProgress}%)`,
                                    }}
                                >
                                    <span className="progress_text">{actualProgress}%</span>
                                </div>
                                <button className="save_btn">Save record</button>
                                <button className="next_btn">Next Task</button>
                            </div>
                        </div>
                    </div>
                    <div className="resalt_second_container">
                        <p className="topic_train">task details</p>
                        <div className="result_image">
                            <p className="matchname">{randomImageName}</p>
                            {randomImageSrc && <img src={randomImageSrc} alt={randomImageName} className="image_resalt" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Result;
