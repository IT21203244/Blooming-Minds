// src/components/VisualLearning/VisualHomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

// Import images explicitly
import counting from './img/30971-scaled.jpg';
import colorMatching from './img/school-1-1671827855.jpg'; 

const VisualHomePage = () => {
  return (
    <div className="home-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        {/* Icons will be added later */}
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="tiles-container">
          {/* First Tile Group */}
          <div className="tile-group">
            <div className="tile">
              <Link to="/color-matching" className="tile-link">
                <img src={colorMatching} alt="Letter Writing" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Color Matching</div>
          </div>

          {/* Second Tile Group */}
          <div className="tile-group">
            <div className="tile">
              <Link to="/counting" className="tile-link">
                <img src={counting} alt="Reading" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Count</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualHomePage;
