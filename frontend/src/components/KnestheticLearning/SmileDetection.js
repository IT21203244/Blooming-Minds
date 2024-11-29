import React, { useEffect, useState } from 'react';

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
    <div className="App">
      <h1>Smile Detection</h1>
      {!isLoaded ? (
        <p>Loading video feed...</p>
      ) : (
        <img
          src="http://localhost:5000/video_feed"
          alt="Smile Detection Feed"
          style={{
            width: '50%',
            height: 'auto',
            border: '2px solid black',
          }}
        />
      )}
    </div>
  );
};

export default SmileDetection;
