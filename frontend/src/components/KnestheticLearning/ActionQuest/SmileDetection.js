import React, { useEffect, useState } from 'react';
import './Action.css'
import Smile from './img/smile.jpeg'
const SmileDetection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if the backend is serving the video feed
    const checkVideoFeed = async () => {
      try {
        const response = await fetch('http://localhost:5000/video_feed', { method: 'HEAD' });
        console.log('Video feed response:', response);
        if (response.ok) {
          setIsLoaded(true);
        } else {
          console.error('Video feed not available');
        }
      } catch (error) {
        console.error('Error checking video feed:', error);
      }
    };

    checkVideoFeed();
  }, []);

  return (
    <div >
      <div>
        <p>Action Quest</p>
        <div>
          <div>
            <p>SMILE</p>
            <p>2.00 Miniuts Left</p>
          </div>
          <div>      {!isLoaded ? (
            <p>Camara Opening..</p>
          ) : (
            <img
              src="http://localhost:5000/video_feed"
              alt="Smile Detection Feed"
              className='camara_kni'
            />
          )}</div>
        </div>
      </div>

    </div>
  );
};

export default SmileDetection;
