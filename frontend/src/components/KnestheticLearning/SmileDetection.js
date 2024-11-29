import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function CameraFeed() {
  const [prediction, setPrediction] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null); // Store interval reference for cleanup

  useEffect(() => {
    const video = videoRef.current;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((err) => {
          console.log("Error: " + err);
        });
    }

    // Start predicting every second
    intervalRef.current = setInterval(() => {
      captureFrameAndPredict();
    }, 1000); // Send every second

    // Cleanup when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const captureFrameAndPredict = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');

    try {
      const response = await axios.post('http://localhost:5000/predict', {
        image: imageData.split(',')[1],  // Get the base64 part of the image
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setPrediction(response.data.prediction); // Set the prediction
    } catch (error) {
      console.error("Error in sending image to backend: ", error);
    }
  };

  return (
    <div>
      <h1>Smile Detection</h1>
      <video ref={videoRef} autoPlay width="640" height="480" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div>
        {prediction && (
          <h2>{prediction === "Smile" ? "😊 Smile detected!" : "😞 No Smile detected"}</h2>
        )}
      </div>
    </div>
  );
}

export default CameraFeed;
