// src/components/ReadWriteLearning/ReadWriteHomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

// Import images explicitly
import readingImage from './img/reading.png';
import letterWritingImage from './img/writing.jpg'; // Example of letter writing image

const ReadWriteHomePage = () => {
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
              <Link to="/letter-writing" className="tile-link">
                <img src={letterWritingImage} alt="Letter Writing" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Writing Letter</div>
          </div>

          {/* Second Tile Group */}
          <div className="tile-group">
            <div className="tile">
              <Link to="/reading" className="tile-link">
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

export default ReadWriteHomePage;
