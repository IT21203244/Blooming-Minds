// src/components/VisualLearning/VisualHomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './MathGameSelectionHome.css';

// Import images explicitly
import counting from './img/countfingers.png';
import mathconcept from './img/mathconcepts.jpg'; 

const MathGameSelectionHome = () => {
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
              <Link to="/math-learning" className="tile-link">
                <img src={mathconcept} alt="Letter Writing" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Math Marvels</div>
          </div>

          {/* Second Tile Group */}
          <div className="tile-group">
            <div className="tile">
              <Link to="/finger-counting-home" className="tile-link">
                <img src={counting} alt="Reading" className="tile-img" />
              </Link>
            </div>
            <div className="tile-name">Counting Fingers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathGameSelectionHome;
