import React from 'react';
import { Link } from 'react-router-dom';
import './FingerCountingHome.css';

// Importing images
import sun from './img/sun3.png';
import bfly from './img/bfly1.png';
import mroom from './img/mroom1.png';
import rbow from './img/rbow1.png';
import star from './img/star1.png';
import cloud from './img/c1.png';

const FingerCountingHome = () => {
  return (
    <div className="home-container">
      {/* Left Sidebar */}
      <div className="sidebar"></div>

      {/* Floating Image */}
      <img src={sun} alt="Sun" className="floating-image" />
      <img src={bfly} alt="bfly" className="floating-image1" />
      <img src={mroom} alt="mroom" className="floating-image2" />
      <img src={rbow} alt="rbow" className="floating-image3" />
      <img src={star} alt="star" className="floating-image4" />
      <img src={cloud} alt="cloud" className="floating-image5" />

      {/* Main Content */}
      <div className="content">
        <div className="button-group">
          {/* EASY Button */}
          <div className="button-item">
            <Link to="/finger-counting/easy" className="custom-button">
              EASY
            </Link>
          </div>

          {/* HARD Button */}
          <div className="button-item">
            <Link to="/finger-counting/hard" className="custom-button">
              HARD
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FingerCountingHome;