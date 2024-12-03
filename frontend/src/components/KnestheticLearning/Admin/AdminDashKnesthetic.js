import React, { useState, useEffect } from 'react';
import './admin.css'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
function AdminDashKnesthetic() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);  // Add a loading state
    const [message, setMessage] = useState(''); // Message for success/error
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true); // Set loading to true when starting the fetch
                const response = await fetch('http://localhost:5000/getStudentRecords');
                const result = await response.json();
                if (response.ok) {
                    setStudents(result.students);
                } else {
                    console.error(result.error);
                }
            } catch (error) {
                console.error('Error fetching student records:', error);
            } finally {
                setLoading(false); // Set loading to false when fetch is complete
            }
        };

        fetchStudents();
    }, []);

    const deleteStudent = async (_id) => {
        // Confirm before deleting
        const confirmed = window.confirm("Are you sure you want to delete this student record?");
        if (!confirmed) return;  // If the user cancels the deletion, do nothing

        try {
            setLoading(true); // Set loading to true while deleting
            const response = await fetch(`http://localhost:5000/deleteStudentRecord/${_id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                // Remove the deleted student from the state to update the UI
                setStudents((prevStudents) => prevStudents.filter((student) => student._id !== _id));
                alert("Student deleted successfully!"); // Success message
            } else {
                alert("Error: " + result.error); // Error message
            }
        } catch (error) {
            setMessage('Error deleting student: ' + error.message); // Error handling
        } finally {
            setLoading(false); // Set loading to false when done
        }
    };
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };
    const filteredStudents = students.filter(student =>
        student.studentName.toLowerCase().includes(searchQuery) ||
        student.studentID.toString().includes(searchQuery)
    );
    const generateReport = () => {
        const doc = new jsPDF();

        // Title of the report
        doc.setFontSize(18);
        doc.text('Student Records Report', 14, 15);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

        // Define the table column headers
        const headers = [
            ['Student ID', 'Name', 'Progress', 'Task Name', 'Spent Time', 'Age', 'Description']
        ];

        // Map the student data to table rows
        const data = students.map(student => [
            student.studentID,
            student.studentName,
            `${student.actualProgress}%`,
            student.randomImageName,
            `${student.timeSpent} seconds`,
            student.age,
            student.description,
        ]);

        // Generate the table
        doc.autoTable({
            head: headers,
            body: data,
            startY: 30,
        });

        // Save the PDF
        doc.save('Student_Records_Report.pdf');
    };
    return (
        <div>
            <div className="student-records-container">
                <h2 className='table_name'>Student Records</h2>
                {loading ? (
                    <div className="loading-message">Loading...</div> // Show loading message when fetching or deleting
                ) : (
                    <div>
                        <div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search by Student Name, Student ID."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="search-bar"
                                />
                            </div>
                            <div>
                                <button onClick={generateReport} className="generate-report-btn">
                                    Generate PDF Report
                                </button>
                            </div>

                        </div>
                        <table className="student-records-table">
                            <thead>
                                <tr>
                                    <th className='tble_kin_head'>Student ID</th>
                                    <th className='tble_kin_head'>Name</th>
                                    <th className='tble_kin_head'>Progress</th>
                                    <th className='tble_kin_head'>Task Name</th>
                                    <th className='tble_kin_head'>Spent time</th>
                                    <th className='tble_kin_head'>Age</th>
                                    <th className='tble_kin_head'>Description</th>
                                    <th className='tble_kin_head'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td className='tble_kin_bd'>{student.studentID}</td>
                                        <td className='tble_kin_bd'>{student.studentName}</td>
                                        <td className='tble_kin_bd'>{student.actualProgress}%</td>
                                        <td className='tble_kin_bd'>{student.randomImageName}</td>
                                        <td className='tble_kin_bd'>{student.timeSpent} seconds</td>
                                        <td className='tble_kin_bd'>{student.age}</td>
                                        <td className='tble_kin_bd'>{student.description}</td>
                                        <td className='tble_kin_bd'>
                                            <button
                                                onClick={() => deleteStudent(student._id)}
                                                className="delete_btn_kin"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashKnesthetic;
