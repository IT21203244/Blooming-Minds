// src/components/VisualLearning/VisualHomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './VStatHome.css';

// Import images explicitly
import counting from './img/count.png';
import colorMatching from './img/paint.png'; 

const VStatHome = () => {
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
              <Link to="/vstat-color-home" className="tile-link">
                <img src={colorMatching} alt="Letter Writing" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Color Matching</div>
          </div>

          {/* Second Tile Group */}
          <div className="tile-group">
            <div className="tile">
              <Link to="/fcount-progress" className="tile-link">
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

export default VStatHome;
