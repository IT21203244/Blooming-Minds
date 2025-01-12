import React from 'react';
import { Link } from 'react-router-dom';
import './ColorMatchingHome.css';

// Importing images
import sun from './img/sun.jpg';
import bfly from './img/bfly.jpg';
import mroom from './img/mroom.jpg';
import rbow from './img/rbow.jpg';
import star from './img/star.jpg';
import cloud from './img/Picture1.png';

const ColorMatchingHome = () => {
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
            <Link to="/color-matching-game/easy" className="custom-button">
              EASY
            </Link>
          </div>

          {/* MEDIUM Button */}
          <div className="button-item">
            <Link to="/color-matching-game/medium" className="custom-button">
              MEDIUM
            </Link>
          </div>

          {/* HARD Button */}
          <div className="button-item">
            <Link to="/color-matching-game/hard" className="custom-button">
              HARD
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMatchingHome;
