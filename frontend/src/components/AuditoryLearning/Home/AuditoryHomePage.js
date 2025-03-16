import React, { useEffect, useState } from 'react';
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
import Man from "./images/man.png";
import Logo from "./images/Logo.png";
import School from "./images/school.png";
import Sea from "./images/sea.png";
import En from "./images/Envirnment.png";

function AuditoryHomePage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [audiogames, setAudiogames] = useState([]);
  const [attemptCount, setAttemptCount] = useState({});

  useEffect(() => {
    // Fetch lessons, audiogames, and attempt count from the backend
    const fetchData = async () => {
      try {
        // Fetch lessons
        const lessonsResponse = await fetch('http://localhost:5000/api/get_lessons');
        if (!lessonsResponse.ok) {
          throw new Error('Network response for lessons was not ok');
        }
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.lessons);

        // Fetch audiogames
        const audiogamesResponse = await fetch('http://localhost:5000/api/get_audiogames');
        if (!audiogamesResponse.ok) {
          throw new Error('Network response for audiogames was not ok');
        }
        const audiogamesData = await audiogamesResponse.json();
        setAudiogames(audiogamesData.audiogames);

        // Fetch attempt count
        const attemptCountResponse = await fetch('http://localhost:5000/api/get_attempt_count');
        if (!attemptCountResponse.ok) {
          throw new Error('Network response for attempt count was not ok');
        }
        const attemptCountData = await attemptCountResponse.json();
        setAttemptCount(attemptCountData.attempt_count);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleStartNowClick = () => {
    navigate('/AllLessons');
  };

  const handleStartAudioGame = (lessonLNumber) => {
    navigate(`/audiogames`, { state: { lessonLNumber: lessonLNumber } });
  };
  
  const handleStartAudioBook = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleAdminNowClick = () => {
    navigate('/AdminHome');
  };

  const handleAnalysisNowClick = () => {
    navigate('/LessonResults');
  };

  // Function to count audiogame questions for a specific lesson
  const countAudiogameQuestions = (lessonNumber) => {
    return audiogames.filter(game => game.number === lessonNumber).length;
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
            Recommended Lessons<span className="auditory_lessons_count">{lessons.length} lessons</span>
          </h2>
          <div className="auditory_lessons">
            {lessons.map((lesson, index) => (
              <div key={index} className="auditory_lesson_card">
                <img src={lesson.imageURL} alt={lesson.title} />
                <div className="auditory_lesson_info">
                  <h3>{lesson.lnumber} - {lesson.title}</h3>
                  {/* Display the number of audio book questions */}
                  <p><strong>Audio Book Questions:</strong> {lesson.questions ? lesson.questions.length : 0}</p>
                  {/* Display the number of audiogame questions */}
                  <p><strong>Audio Game Questions:</strong> {countAudiogameQuestions(lesson.lnumber)}</p>
                  {/* Display the attempt count for the lesson */}
                  <p><strong>Attempt Count:</strong> 
  { 
    (attemptCount[lesson.lnumber] || 0) % 2 === 0 
      ? (attemptCount[lesson.lnumber] || 0) / 2 
      : ((attemptCount[lesson.lnumber] || 0) / 2) + 0.5 
  }
</p>
                </div>
                <button
                  className="audio_lessonlist_button"
                  onClick={() => handleStartAudioBook(lesson._id)}
                >
                  Start AudioBook
                </button>
                <button
                  className="audio_lessonlist_button"
                  onClick={() => handleStartAudioGame(lesson.lnumber)}
                >
                  Start AudioGame
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditoryHomePage;