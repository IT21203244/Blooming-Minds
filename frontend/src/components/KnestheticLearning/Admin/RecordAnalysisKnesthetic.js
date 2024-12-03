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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/getStudentRecords');
        const result = await response.json();
        if (response.ok) {
          setStudents(result.students);
          processChartData(result.students);
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

  const getRandomColor = () => {
    const colors = [
      '#FF5733', '#33FF57', '#5733FF', '#FF33A6', '#33FFF2', '#F2FF33', '#FF8C33', '#8C33FF',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
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
                  title: { display: true, text: 'Student Number' },
                  ticks: { stepSize: 1 },
                },
              },
            }}
          />
        ) : (
          <p>No data to display.</p>
        )}
      </div>
    </div>
  );
}

export default RecordAnalysisKnesthetic;
