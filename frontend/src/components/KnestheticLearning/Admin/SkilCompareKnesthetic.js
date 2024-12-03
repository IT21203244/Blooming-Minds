import React, { useState, useEffect } from 'react';

function SkilCompareKnesthetic() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchID, setSearchID] = useState(""); // state for the search input
  const [isSearched, setIsSearched] = useState(false); // state to track if search is performed

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/getStudentRecords');
        const result = await response.json();
        if (response.ok) {
          setStudents(result.students);
          setFilteredStudents(result.students); // Set all students initially
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error('Error fetching student records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Function to handle search/filtering based on studentID
  const handleSearch = () => {
    setIsSearched(true); // Indicate that the search is done
    if (searchID === "") {
      setFilteredStudents([]); // If no ID is entered, clear the filtered list
    } else {
      const filtered = students.filter(student => student.studentID.toString().includes(searchID));
      setFilteredStudents(filtered); // Filter students by studentID
    }
  };

  return (
    <div>
      <div className='nav_bar_kin_admin main_nav'>
        <p className='kin_admin_nav kin_admin_nav_active_main' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>letter Quest</p>
        <p className='kin_admin_nav '>Action Quest</p>
        <p className='kin_admin_nav' onClick={() => (window.location.href = '/KnestheticHome')}>Logout</p>
      </div>
      <div className="student-records-container">
        <div className='nav_bar_kin_admin'>
          <p className='kin_admin_nav ' onClick={() => (window.location.href = '/KnestheticAdmin')}>All Records</p>
          <p className='kin_admin_nav' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>record Analysis</p>
          <p className='kin_admin_nav kin_admin_nav_active' onClick={() => (window.location.href = '/skilCompareKnesthetic')}>skill compare</p>
        </div>
      </div>
      <div className="student-records-container">
        <h2 className='table_name'>Student Records</h2>
        
        {/* Input field to enter studentID */}
        <input
          type="text"
          placeholder="Enter Student ID"
          value={searchID}
          onChange={(e) => setSearchID(e.target.value)} // Update search ID as user types
          className="search-input"
        />
        
        {/* Compare Button */}
        <button onClick={handleSearch} className="compare-btn">Compare</button>

        {loading ? (
          <div className="loading-message"></div>
        ) : (
          isSearched && (
            <div>
              {/* Display filtered students only after search */}
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
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-records">No records found for Student ID: {searchID}</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default SkilCompareKnesthetic;
