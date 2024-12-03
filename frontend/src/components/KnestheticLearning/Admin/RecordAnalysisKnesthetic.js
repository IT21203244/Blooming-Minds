import React, { useState, useEffect } from 'react';
function RecordAnalysisKnesthetic() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
  return (
    <div className="student-records-container">
      <div className='nav_bar_kin_admin'>
        <p className='kin_admin_nav ' onClick={() => (window.location.href = '/KnestheticAdmin')}>All Records</p>
        <p className='kin_admin_nav kin_admin_nav_active' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>record Analysis</p>
        <p className='kin_admin_nav' onClick={() => (window.location.href = '/skilCompareKnesthetic')}>skil compare</p>
      </div>
      <div >
        <h2 className='table_name'>Student Records</h2>
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : (
          <div>
            <table className="student-records-table">
              <thead>
                <tr>
                  <th className='tble_kin_head'>Student ID</th>
                  <th className='tble_kin_head'>Name</th>
                  <th className='tble_kin_head'>Progress</th>
                  <th className='tble_kin_head'>Spent time</th>
                  <th className='tble_kin_head'>Task Name</th>
                  <th className='tble_kin_head'>Age</th>
                  <th className='tble_kin_head'>Date</th>
                  <th className='tble_kin_head'>Description</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className='tble_kin_bd'>{student.studentID}</td>
                    <td className='tble_kin_bd'>{student.studentName}</td>
                    <td className='tble_kin_bd'>{student.actualProgress}%</td>
                    <td className='tble_kin_bd'>{student.timeSpent} Seconds</td>
                    <td className='tble_kin_bd'>{student.randomImageName}</td>
                    <td className='tble_kin_bd'>{student.age}</td>
                    <td className='tble_kin_bd'>{student.date}</td>
                    <td className='tble_kin_bd'>{student.description || 'No Description'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecordAnalysisKnesthetic
