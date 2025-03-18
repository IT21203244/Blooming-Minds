import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VLProgressDashboard.css';

const VLProgressDashboard = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProgressCharts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert("User is not authenticated. Please log in.");
          return;
        }

        const response = await axios.get(
          'http://localhost:5000/visual_learning/child_progress', 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',  // We expect a ZIP file in response
          }
        );
        
        const url = URL.createObjectURL(response.data);
        setCharts(url);
      } catch (err) {
        setError('Error fetching progress charts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressCharts();
  }, []);

  return (
    <div className="progress-dashboard">
      <h1>Child's Learning Progress</h1>
      
      {loading && <p>Loading charts...</p>}
      
      {error && <p className="error-message">{error}</p>}
      
      {charts && !loading && !error && (
        <div className="chart-container">
          <h3>Download Learning Progress Charts</h3>
          <a href={charts} download="child_progress_charts.zip">
            <button>Download Progress Charts (ZIP)</button>
          </a>
        </div>
      )}
      
      <div className="summary-container">
        <h3>Learning Summary</h3>
        <p>This section can include additional information such as performance metrics, feedback, or recommended levels based on the data.</p>
      </div>
    </div>
  );
};

export default VLProgressDashboard;
