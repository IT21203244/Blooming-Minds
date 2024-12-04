import React, { useEffect, useState } from 'react';

function AddRecord() {
    const [formData, setFormData] = useState({
        studentID: '',
        studentName: '',
        age: '',
        description: '',
        actualProgress: '',
        randomImageName: '',
        timeSpent: '',
        clickedLetters: '',
        date: '',
        taskCompletionTime: ''  // New field to store the task completion time
    });

    // Fetch data from localStorage when the component mounts
    useEffect(() => {
        const savedActualProgress = localStorage.getItem('actualProgress') || '';
        const savedRandomImageName = localStorage.getItem('randomImageName') || '';
        const savedTimeSpent = localStorage.getItem('timeSpent') || '';
        const clickedLetters = localStorage.getItem('userEnteredWord') || '';
        const todayDate = new Date().toISOString().split('T')[0];  // Get today's date
        const taskCompletionTime = localStorage.getItem('taskCompletionTime') || '';  // Fetch the saved time

        // Setting the form data state
        setFormData({
            actualProgress: savedActualProgress,
            randomImageName: savedRandomImageName,
            timeSpent: savedTimeSpent,
            clickedLetters: clickedLetters,
            date: todayDate,
            taskCompletionTime: taskCompletionTime, // Set the task completion time
        });
    }, []);  // This useEffect runs only once on component mount

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const studentData = {
            studentID: formData.studentID,
            studentName: formData.studentName,
            age: formData.age,
            description: formData.description,
            actualProgress: formData.actualProgress,
            randomImageName: formData.randomImageName,
            timeSpent: formData.timeSpent,
            date: formData.date,
            clickedLetters: formData.clickedLetters,
            taskCompletionTime: formData.taskCompletionTime,  // Send task completion time as well
        };

        try {
            const response = await fetch('http://localhost:5000/addStudentRecord', {
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
        <div className='save_from_continer'>
            <div>
                <p className='topic_from_name'>Save Student Data</p>
                <form className='from_add_data' onSubmit={handleSubmit}>
                    <label className="lable_from_kin">Student ID</label><br />
                    <input
                        type="text"
                        name="studentID"
                        className="input_from_kin"
                        value={formData.studentID}
                        onChange={handleChange}
                        required
                    /><br />
                    <label className="lable_from_kin">Student Entered Word</label><br />
                    <input
                        type="text"
                        name="clickedLetters"
                        className="input_from_kin"
                        value={formData.clickedLetters}
                        onChange={handleChange}
                        readOnly
                    /><br />
                    <div className='input_row'>
                        <div>
                            <label className="lable_from_kin">Spent Time (In Seconds)</label><br />
                            <input
                                type="text"
                                name="timeSpent"
                                className="input_from_kin"
                                readOnly
                                value={formData.timeSpent}
                            /><br />
                        </div>
                        <div>
                            <label className="lable_from_kin">Progress (%)</label><br />
                            <input
                                type="text"
                                name="actualProgress"
                                className="input_from_kin"
                                readOnly
                                value={formData.actualProgress}
                            /><br />
                        </div>
                    </div>
                    <div className='input_row'>
                        <div>
                            <label className="lable_from_kin">Task Name</label><br />
                            <input
                                type="text"
                                name="randomImageName"
                                className="input_from_kin"
                                readOnly
                                value={formData.randomImageName}
                            /><br />
                        </div>
                        <div>
                            <label className="lable_from_kin">Date</label><br />
                            <input
                                type="text"
                                name="date"
                                className="input_from_kin"
                                readOnly
                                value={formData.date}
                            /><br />
                        </div>
                    </div>

                    <label className="lable_from_kin">Task Completion Time</label><br />
                    <input
                        type="text"
                        name="taskCompletionTime"
                        className="input_from_kin"
                        value={formData.taskCompletionTime}
                        readOnly
                    /><br />

                    <label className="lable_from_kin">Student Name</label><br />
                    <input
                        type="text"
                        name="studentName"
                        className="input_from_kin"
                        value={formData.studentName}
                        onChange={handleChange}
                        required
                    /><br />

                    <label className="lable_from_kin">Student Age</label><br />
                    <input
                        type="number"
                        name="age"
                        className="input_from_kin"
                        value={formData.age}
                        onChange={handleChange}
                        required
                    /><br />

                    <label className="lable_from_kin">Description</label><br />
                    <textarea
                        name="description"
                        className="input_from_kin"
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                    /><br />
                    <button type="submit" className='save_btn_from'>Save</button>
                </form>
            </div>
        </div>
    );
}

export default AddRecord;

