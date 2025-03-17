import React, { useEffect, useState } from "react";

function Result() {
    // Retrieve data from localStorage
    const actualProgress = parseInt(localStorage.getItem("actualProgress")) || 0;
    const randomImageName = localStorage.getItem("randomImageName");
    const userEnteredWord = localStorage.getItem("userEnteredWord");
    const studentName = localStorage.getItem("userName");
    const studentAtempts = localStorage.getItem("attempts");
    const studentLevel = localStorage.getItem("UserLevel");

    const handleSaveRecord = async (e) => {
        e.preventDefault();
        const studentData = {
            actualProgress,
            studentName,
            randomImageName,
            userEnteredWord,
            studentAtempts,
            studentLevel
        };

        try {
            const response = await fetch('http://localhost:5000/addStudentLetterRecord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Student record added successfully');
                window.location.href = '/KnestheticHome';
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error during the request:', error);
            alert('An error occurred while saving the student record');
        }
    };



    return (
        <div>
            <div>
                <p className="topic_pro">Result <span></span></p>
                <div className="result_container">
                    <div className="new_boc">
                        <div>
                            <p className="topic_train">Progress : {actualProgress}%</p>
                            <p className="topic_train">Student Name : {studentName} </p>
                            <p className="topic_train">Task Name : {randomImageName}</p>
                            <p className="topic_train">User Entered Word : {userEnteredWord || 'Not Entered'}</p>
                            <p className="topic_train">Attempts : {studentAtempts}</p>
                            <p className="topic_train">Level : {studentLevel}</p>
                        </div>
                        <button className="savebtn_kin" onClick={handleSaveRecord}>Save Data</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Result;
