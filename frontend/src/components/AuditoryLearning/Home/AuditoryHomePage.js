import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
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

function AuditoryHomePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [audiogames, setAudiogames] = useState([]);
  const [transcriptionResults, setTranscriptionResults] = useState([]);
  const [attemptCount, setAttemptCount] = useState({});
  const [averageCorrectness, setAverageCorrectness] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const fetchTranscriptionResults = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not logged in!");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/get_transcriptions");
      const allResults = response.data.transcriptions;

      // Filter results for the current user
      const userResults = allResults.filter(
        (result) => result.userId === userId
      );

      setTranscriptionResults(userResults);

      // Calculate average correctness
      if (userResults.length > 0) {
        const totalCorrectness = userResults.reduce((sum, result) => sum + result.correctness, 0);
        const average = totalCorrectness / userResults.length;
        setAverageCorrectness(Math.round(average));
      } else {
        setAverageCorrectness(0);
      }

      setShowResults(true);
    } catch (error) {
      console.error("Error fetching transcription results:", error);
      alert("Failed to fetch transcription results. Please try again later.");
    }
  };

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
    fetchTranscriptionResults(); // Fetch transcription results when the component mounts
  }, []);

  const handleStartNowClick = () => {
    navigate('/AllLessons');
  };

  const handleStartAudioGame = (lessonLNumber) => {
    navigate(`/audiogames`, { state: { lessonLNumber } });
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

  // Filter lessons based on average correctness
  const recommendedLessons = averageCorrectness > 75
    ? lessons.filter(lesson => lesson.audiobook_type === "two word answer question")
    : lessons.filter(lesson => lesson.audiobook_type === "one word answer question");

  const continueWatchingLessons = lessons.filter(lesson => 
    averageCorrectness > 75
      ? lesson.audiobook_type !== "two word answer question"
      : lesson.audiobook_type !== "one word answer question"
  );

  return (
    <div className="auditory_container">
      {/* Sidebar */}
      <div className="auditory_sidebars">
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

        {/* Recommended Lessons */}
        <div className="auditory_continue_section">
          <h2>
            Recommended Lessons<span className="auditory_lessons_count">{recommendedLessons.length} lessons</span>
          </h2>
          <div className="auditory_lessons">
            {recommendedLessons.map((lesson, index) => (
              <div key={index} className="auditory_lesson_card">
                <img src={lesson.imageURL} alt={lesson.title} />
                <div className="auditory_lesson_info">
                  <h3>{lesson.lnumber} - {lesson.title} - {lesson.audiobook_type}</h3>
                  <p><strong>Audio Book Questions:</strong> {lesson.questions ? lesson.questions.length : 0}</p>
                  <p><strong>Audio Game Questions:</strong> {countAudiogameQuestions(lesson.lnumber)}</p>
                  <p><strong>Attempt Count:</strong> {attemptCount[lesson.lnumber] || 0}</p>
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

        {/* Continue Watching */}
        <div className="auditory_continue_section">
          <h2>
            Continue Watching<span className="auditory_lessons_count">{continueWatchingLessons.length} lessons</span>
          </h2>
          <div className="auditory_lessons">
            {continueWatchingLessons.map((lesson, index) => (
              <div key={index} className="auditory_lesson_card">
                <img src={lesson.imageURL} alt={lesson.title} />
                <div className="auditory_lesson_info">
                  <h3>{lesson.lnumber} - {lesson.title} - {lesson.audiobook_type}</h3>
                  <p><strong>Audio Book Questions:</strong> {lesson.questions ? lesson.questions.length : 0}</p>
                  <p><strong>Audio Game Questions:</strong> {countAudiogameQuestions(lesson.lnumber)}</p>
                  <p><strong>Attempt Count:</strong> {attemptCount[lesson.lnumber] || 0}</p>
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

        {/* Display Average Correctness */}
        {showResults && (
          <div className="auditory_average_correctness">
            <h3>Your Average Correctness: {averageCorrectness}%</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditoryHomePage;