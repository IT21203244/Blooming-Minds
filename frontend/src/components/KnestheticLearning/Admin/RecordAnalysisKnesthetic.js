import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function RecordAnalysisKnesthetic() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [topStudents, setTopStudents] = useState({});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/getStudentRecords');
        const result = await response.json();
        if (response.ok) {
          setStudents(result.students);
          processChartData(result.students);
          processTopStudents(result.students);
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

  const processChartData = (students) => {
    if (students.length === 0) return;

    const taskFrequency = students.reduce((acc, student) => {
      const taskName = student.randomImageName || 'Unknown Task';
      acc[taskName] = (acc[taskName] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(taskFrequency);
    const data = Object.values(taskFrequency);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Student Count',
          data,
          backgroundColor: labels.map(() => getRandomColor()),
          borderWidth: 1,
        },
      ],
    });
  };
  const processTopStudents = (students) => {
    const taskTopStudents = {};

    students.forEach((student) => {
      const taskName = student.randomImageName || 'Unknown Task';
      if (!taskTopStudents[taskName]) taskTopStudents[taskName] = [];
      taskTopStudents[taskName].push({
        studentID: student.studentID,    // Store student ID
        name: student.studentName, // Store student name
        progress: student.progress,
        spentTime: student.spentTime,
      });
    });

    // Sort the students for each task by progress and spentTime
    for (const taskName in taskTopStudents) {
      const sortedStudents = taskTopStudents[taskName]
        .sort((a, b) => b.progress - a.progress || b.spentTime - a.spentTime)
        .slice(0, 3); // Get top 3 students

      // Store only the names and IDs of the top 3 students
      taskTopStudents[taskName] = sortedStudents.map(student => ({
        studentID: student.studentID,
        name: student.name
      }));
    }

    // Update the state
    setTopStudents(taskTopStudents);
  };

  const getRandomColor = () => {
    const colors = [
      '#2b69b2', '#2b69b2', '#2b69b2', '#2b69b2', '#2b69b2', '#2b69b2', '#2b69b2', '#2b69b2',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div>
      <div className='nav_bar_kin_admin main_nav'>
        <p className='kin_admin_nav kin_admin_nav_active_main' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>letter Quest</p>
        <p className='kin_admin_nav ' onClick={() => (window.location.href = '/actionQuestAdmin')}>Action Quest</p>
        <p className='kin_admin_nav' onClick={() => (window.location.href = '/KnestheticHome')}>Logout</p>
      </div>
      <div className="student-records-container">
        <div className='nav_bar_kin_admin'>
          <p className='kin_admin_nav ' onClick={() => (window.location.href = '/KnestheticAdmin')}>All Records</p>
          <p className='kin_admin_nav kin_admin_nav_active' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>record Analysis</p>
          <p className='kin_admin_nav' onClick={() => (window.location.href = '/skilCompareKnesthetic')}>skill compare</p>
        </div>
        <h2 className='table_name'>record Analysis</h2>
        <br />  <br />
        <p className='name_task_king'>Attendance Chart</p>
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : chartData ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Task Frequency Chart' },
                },
                scales: {
                  x: { title: { display: true, text: 'Tasks Name' } },
                  y: {
                    title: { display: true, text: 'Student Count' },
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          ) : (
            <p>No data to display.</p>
          )}
        </div>
        <br />  <br />
        <p className='name_task_king'>Top Players</p>
        <div className="top_students">
          {Object.keys(topStudents).length > 0 ? (
            Object.keys(topStudents).map((taskName) => (
              <div className='card_play' key={taskName}>
                <h3 className='tsk_name'>{taskName}</h3>
                <div>
                  {topStudents[taskName].map((student, index) => (
                    <div className='tsk_data' key={index}>
                      {index + 1}. {student.name} (ID: {student.studentID})
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No top students to display.</p>
          )}
        </div>


      </div>
    </div>
  );
}

export default RecordAnalysisKnesthetic;
