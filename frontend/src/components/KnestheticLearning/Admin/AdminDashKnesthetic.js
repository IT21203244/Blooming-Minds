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
    const generateReport = () => {
        const doc = new jsPDF("landscape");

        // Title of the report
        doc.setFontSize(18);
        doc.text('Student Records Report', 14, 15);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

        // Define the table column headers
        const headers = [
            ['Student ID', 'Name', 'Progress', 'Task Name', 'Enterd Word', 'Spent Time', 'Age', 'Date', 'Task Allocated Time', 'Description']
        ];

        // Map the student data to table rows
        const data = students.map(student => [
            student.studentID,
            student.studentName,
            `${student.actualProgress}%`,
            student.randomImageName,
            student.taskCompletionTime,
            `${student.timeSpent} seconds`,
            student.age,
            student.date,
            student.clickedLetters || 'Not Entered',
            student.description || 'No Description',
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
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredStudents = students.filter(student => {
        const name = student.studentName ? student.studentName.toLowerCase() : '';
        const id = student.studentID ? student.studentID.toString() : '';
        const description = student.description ? student.description.toLowerCase() : '';
        return name.includes(searchQuery) || id.includes(searchQuery) || description.includes(searchQuery);
    });

    return (
        <div>
            <div className='nav_bar_kin_admin main_nav'>
                <p className='kin_admin_nav kin_admin_nav_active_main' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>letter Quest</p>
                <p className='kin_admin_nav '>Action Quest</p>
                <p className='kin_admin_nav' onClick={() => (window.location.href = '/KnestheticHome')}>Logout</p>
            </div>
            <div className="student-records-container">
                <div className='nav_bar_kin_admin'>
                    <p className='kin_admin_nav kin_admin_nav_active' onClick={() => (window.location.href = '/KnestheticAdmin')}>All Records</p>
                    <p className='kin_admin_nav' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>record Analysis</p>
                    <p className='kin_admin_nav' onClick={() => (window.location.href = '/skilCompareKnesthetic')}>skill compare</p>
                </div>
                <div >
                    <h2 className='table_name'>Student Records</h2>
                    {loading ? (
                        <div className="loading-message">Loading...</div>
                    ) : (
                        <div>
                            <div>
                                <div className='action_set_kin_admin'>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Search by name, ID, or description..."
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            className="search_bar_kin_admin"
                                        />
                                    </div>

                                    <button onClick={generateReport} className="generate_report_btn">
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                            <table className="student-records-table">
                                <thead>
                                    <tr>
                                        <th className='tble_kin_head'>Student ID</th>
                                        <th className='tble_kin_head'>Name</th>
                                        <th className='tble_kin_head'>Progress</th>
                                        <th className='tble_kin_head'>Spent time</th>
                                        <th className='tble_kin_head'>Task Name</th>
                                        <th className='tble_kin_head'>Student Enter answer</th>
                                        <th className='tble_kin_head'>Age</th>
                                        <th className='tble_kin_head'>Date</th>
                                        <th className='tble_kin_head'>Allocated Time</th>
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
                                            <td className='tble_kin_bd'>{student.timeSpent} Seconds</td>
                                            <td className='tble_kin_bd'>{student.randomImageName}</td>
                                            <td className='tble_kin_bd'>{student.clickedLetters || 'Not Entered'}</td>
                                            <td className='tble_kin_bd'>{student.age}</td>
                                            <td className='tble_kin_bd'>{student.date}</td>
                                            <td className='tble_kin_bd'>{student.taskCompletionTime}</td>
                                            <td className='tble_kin_bd'>{student.description || 'No Description'}</td>
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
        </div>

    );
}

export default AdminDashKnesthetic;
