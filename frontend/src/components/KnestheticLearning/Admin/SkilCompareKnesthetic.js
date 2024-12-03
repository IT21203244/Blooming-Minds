import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

  // Analyze data to get task attempts and progress
  const analyzeData = () => {
    const taskAttempts = {};

    filteredStudents.forEach((student) => {
      // Calculate task attempts
      const taskName = student.randomImageName;
      const progress = student.actualProgress;

      if (!taskAttempts[taskName]) {
        taskAttempts[taskName] = [];
      }
      taskAttempts[taskName].push(progress); // Add the progress of each attempt for the task
    });

    return taskAttempts;
  };

  const taskAttempts = analyzeData();
  const handleDownloadPDF = () => {
    // Select the main container with the table and cards
    const input = document.querySelector('.pdf_continer');

    if (!input) {
      alert('No data available to download!');
      return;
    }

    // Use html2canvas to render the container into a canvas
    html2canvas(input, {
      scale: 2, // Improves resolution
      useCORS: true, // Enables cross-origin content
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png'); // Convert canvas to image
      const pdf = new jsPDF('p', 'mm', 'a4'); // Create a new PDF document

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); // Add image to the PDF

      pdf.save('Student_Records.pdf'); // Save the PDF
    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
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
        <h2 className='table_name'>compare Student Records</h2>

        <div className='compir_sectionn_main'>
          <div className='compir_sectionn'>
            {/* Input field to enter studentID */}
            <input
              type="text"
              placeholder="Enter Student ID"
              value={searchID}
              onChange={(e) => setSearchID(e.target.value)} // Update search ID as user types
              className="search_input_compair"
            />
            <button onClick={handleSearch} className="compare_btn">Compare</button>
          </div>
          <button onClick={handleDownloadPDF} className="download_btn_king">Download PDF</button>
        </div>

      </div>
      <div className='pdf_continer'>
     
        {filteredStudents.length > 0 && (
          <p className='name_data_stdn'>Student ID : {filteredStudents[0].studentID}</p>
        )}
        <div className="task-attempts">
          <div className='atempts_card_continer'>
            {Object.entries(taskAttempts).map(([taskName, attempts], index) => (
              <div className='atempts_card' key={taskName}>
                <h4 className='tsk_name_card'>{taskName}</h4>
                <div>
                  {attempts.map((progress, attemptIndex) => (
                    <div key={attemptIndex}>
                      <div className='bar_head_set'>
                        <p> attempt {attemptIndex + 1}</p>
                        <p>{progress}%</p>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : (
          isSearched && (
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
