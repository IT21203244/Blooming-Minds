import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Action.css';
import Smile from './img/smile.jpeg';

const SmileDetection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Start with 0 so the timer doesn't start initially
  const navigate = useNavigate(); // To navigate to /home

  useEffect(() => {
    if (timeLeft === 0) {
      return; // Do nothing if timer is not started yet
    }

    if (timeLeft === 0) {
      // Stop the camera and navigate to /home
      setIsLoaded(false);
      window.location.href = '/';
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [timeLeft, navigate]);

  const handleStartCamera = async () => {
    try {
      const response = await fetch('http://localhost:5000/video_feed', { method: 'HEAD' });
      console.log('Video feed response:', response);
      if (response.ok) {
        setIsLoaded(true);
        setTimeLeft(120); // Start the timer (2 minutes)
      } else {
        console.error('Video feed not available');
      }
    } catch (error) {
      console.error('Error checking video feed:', error);
    }
  };

  return (
    <div className='main_continer'>
      <div>
        <p className='main_topic'>Action Quest</p>
        <div className='action_card_set'>
          <div className='details_set'>
            <p className='word_name'>SMILE</p>
            <p
              className='time_count'
              style={{ color: timeLeft <= 5 ? 'red' : '#2b69b2' }} // Red when 5 seconds or less
            >
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} Minutes Left
            </p>
            <img src={Smile} alt='Smile' className='smile_kni' />
          </div>
          <div className='camara_side'>
            {!isLoaded ? (
              <p className='no_word'>Camera not started. Click the button below to start.</p>
            ) : (
              <img
                src="http://localhost:5000/video_feed"
                alt="Smile Detection Feed"
                className='camara_kni'
              />
            )}
            <button className='btn_start' onClick={handleStartCamera}>
              Start Camera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmileDetection;
