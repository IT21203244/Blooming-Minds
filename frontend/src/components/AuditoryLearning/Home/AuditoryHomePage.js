import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './AuditoryHomePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faTh,
  faUser,
  faChartLine,
  faCogs,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import Man from "./images/man.png"
import Logo from "./images/Logo.png"
import School from "./images/school.png"
import Sea from "./images/sea.png"
import En from "./images/Envirnment.png"



function AuditoryHomePage() {
  const navigate = useNavigate(); 

  const handleStartNowClick = () => {
    navigate('/AllLessons');
  };

  const handleAdminNowClick = () => {
    navigate('/AdminHome');
  };

  const handleAnalysisNowClick = () => {
    navigate('/LessonResults');
  };

  return (
    <div className="auditory_container">
      {/* Sidebar */}
      <div className="auditory_sidebar">
        <div className="auditory_logo">
          <img src={Logo} alt="Blooming Logo" />
        </div>
        <nav className="auditory_nav">
          <a href="#" className="auditory_nav_item active">
            <FontAwesomeIcon icon={faHome} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faTh} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faUser} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faChartLine} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faCogs} className="auditory_icon" />
          </a>
          <a href="#" className="auditory_nav_item">
            <FontAwesomeIcon icon={faSignOutAlt} className="auditory_icon" />
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="auditory_main">
        {/* Search Bar */}
        <div className="auditory_header">
          <input
            type="text"
            placeholder="Search Lesson"
            className="auditory_search"
          />
        </div>

        {/* Welcome Section */}
        <div className="auditory_welcome_section">
          <div className="auditory_welcome_text">
            <h1>Hi, Soundy!</h1><br></br>
            <div className="auditory_start_button_container">
    <button 
    onClick={handleStartNowClick}
    className="auditory_start_button">Start Now</button>&nbsp;&nbsp;
        <button 
    onClick={handleAdminNowClick}
    className="auditory_start_button">Admin Panel</button>&nbsp;&nbsp;
        <button 
    onClick={handleAnalysisNowClick}
    className="auditory_start_button">Analysis Part</button>
  </div>
  
          </div>

          <div className="auditory_welcome_image">
            <img src={Man} alt="Welcome Illustration" />
          </div>
         
        </div>

        {/* Continue Watching */}
        <div className="auditory_continue_section">
          <h2>
           Recomended Lessons<span className="auditory_lessons_count">15 lessons</span>
          </h2>
          <div className="auditory_lessons">
            <div className="auditory_lesson_card">
              <img src={En} alt="Environment" />
              <div className="auditory_lesson_info">
                <h3>Lesson 01</h3>
                <p>Environment</p>
              </div>
            </div>
            <div className="auditory_lesson_card">
              <img src={Sea} alt="Sea" />
              <div className="auditory_lesson_info">
                <h3>Lesson 02</h3>
                <p>Sea</p>
              </div>
            </div>
            <div className="auditory_lesson_card">
              <img src={School} alt="School" />
              <div className="auditory_lesson_info">
                <h3>Lesson 03</h3>
                <p>School</p>
              </div>
            </div>
            <div className="auditory_lesson_card">
              <img src={En} alt="Environment" />
              <div className="auditory_lesson_info">
                <h3>Lesson 01</h3>
                <p>Environment</p>
              </div>
            </div>
            <div className="auditory_lesson_card">
              <img src={Sea} alt="Sea" />
              <div className="auditory_lesson_info">
                <h3>Lesson 02</h3>
                <p>Sea</p>
              </div>
            </div>
            <div className="auditory_lesson_card">
              <img src={School} alt="School" />
              <div className="auditory_lesson_info">
                <h3>Lesson 03</h3>
                <p>School</p>
              </div>
            </div>
            <div className="auditory_lesson_card">
              <img src={Sea} alt="Sea" />
              <div className="auditory_lesson_info">
                <h3>Lesson 02</h3>
                <p>Sea</p>
              </div>
            </div>
            <div className="auditory_lesson_card">
              <img src={School} alt="School" />
              <div className="auditory_lesson_info">
                <h3>Lesson 03</h3>
                <p>School</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditoryHomePage;
