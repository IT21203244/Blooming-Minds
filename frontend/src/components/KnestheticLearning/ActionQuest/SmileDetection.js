import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Action.css';
import Smile from './img/smile.jpeg';

const EmotionDetection = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [targetEmotion, setTargetEmotion] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [showCheckResultButton, setShowCheckResultButton] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const emotions = ['happy', 'sad', 'angry', 'surprise', 'smile'];

  useEffect(() => {
    generateRandomEmotion();
  }, []);

  const generateRandomEmotion = () => {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    setTargetEmotion(randomEmotion);
  };

  const startCamera = async () => {
    setCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Failed to access the camera.');
    }
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL('image/png');
    const blob = await (await fetch(image)).blob();
    const file = new File([blob], 'captured.png', { type: 'image/png' });

    setUploadedImage(file);
    setCameraActive(false);
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());

    await handleUploadCheck(file);
  };

  const handleUploadCheck = async (file) => {
    if (!file) {
      setError('Please capture an image first.');
      return;
    }
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/emotion_check', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setDominantEmotion(data.dominant_emotion);
        setShowCheckResultButton(true);
      } else {
        setError(data.error || 'An error occurred while checking the emotion.');
      }
    } catch (err) {
      setError('Failed to connect to the backend.');
    }
  };

  const checkResult = () => {
    if (dominantEmotion === targetEmotion) {
      setResultMessage('You win! Your emotion matches the target emotion.');
    } else {
      setResultMessage(`You lose! The target emotion was ${targetEmotion}.`);
    }
    setShowUsernameInput(true);
  };

  const handleSaveData = async () => {
    if (!username.trim()) {
      setError('Please enter your name.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/save_emotion_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          dominant_emotion: dominantEmotion,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Data saved successfully!');
        setShowUsernameInput(false);
        setUsername('');
        window.location.reload();
      } else {
        setError(data.error || 'Failed to save data.');
      }
    } catch (err) {
      setError('Failed to connect to the backend.');
    }
  };

  return (
    <div className='main_continer'>
      <div>
        <p className='main_topic'>Action Quest</p>
        <div className='action_card_set'>
          <div className='details_set'>
            <p className='word_name'>{targetEmotion.toUpperCase()}</p><br />
            <img src={Smile} alt='Smile' className='smile_kni' />
          </div>
          <div className='data_set_kin'>
            <div className='by_Image_Section active'>
              <div className="border_card_smile">
                <p className='main_topic_new_sub_add'>Emotion Detection</p>
                <button className="upload_btn_kini" onClick={startCamera}>Do Task</button>
                {cameraActive && (
                  <div className="camera_container">
                    <video ref={videoRef} autoPlay></video>
                    <button className="upload_btn_kini" onClick={captureImage}>Capture</button>
                  </div>
                )}
                {dominantEmotion && (
                  <div className="percentage_container_full_kin">
                    <div className="percentage_column_data">
                      <p>Detected Emotion:</p>
                      <p>{dominantEmotion}</p>
                    </div>
                    {showCheckResultButton && (
                      <button className="upload_btn_kini" onClick={checkResult}>Check Result</button>
                    )}
                    {resultMessage && <p className="result_message">{resultMessage}</p>}
                    {showUsernameInput && (
                      <div className="save_input_container">
                        <input type="text" placeholder="Enter Student name" className='input_roww_smile' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <button className="upload_btn_kini" onClick={handleSaveData}>Save</button>
                      </div>
                    )}
                  </div>
                )}
                {uploadedImage && (
                  <div className='image_kin_set'>
                    <p className='up_img_topic'>Uploaded Image:</p>
                    <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" className="uploaded_image" />
                  </div>
                )}
                {error && <p className="error_message">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default EmotionDetection;