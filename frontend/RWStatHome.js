// src/components/ReadWriteLearning/ReadWriteHomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './RWStatHome.css';

// Import images explicitly
import readingImage from './img/reading.png';
import letterWritingImage from './img/writing.jpg'; 

const RWStatHome = () => {
  return (
    <div className="rwhome-container">
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
              <Link to="/writing-progress-board" className="tile-link">
                <img src={letterWritingImage} alt="Letter Writing" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Writing Letter</div>
          </div>

          {/* Second Tile Group */}
          <div className="tile-group">
            <div className="tile">
              <Link to="/reading-progress-board" className="tile-link">
                <img src={readingImage} alt="Reading" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Reading</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RWStatHome;
