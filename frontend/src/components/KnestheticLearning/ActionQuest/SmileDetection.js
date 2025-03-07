import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Action.css';
import Smile from './img/smile.jpeg';

const SmileDetection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [smilePercentage, setSmilePercentage] = useState(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('image');
  const [username, setUsername] = useState(''); // New state for username
  const [showUsernameInput, setShowUsernameInput] = useState(false); // Toggle input visibility

  useEffect(() => {
    if (timeLeft === 0) return;

    if (timeLeft === 0) {
      setIsLoaded(false);
      window.location.href = '/';
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setUploadedImage(file);
  };

  const handleUploadCheck = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first.');
      return;
    }
    setError('');

    const formData = new FormData();
    formData.append('file', uploadedImage);

    try {
      const response = await fetch('http://localhost:5000/api/smile_check', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setSmilePercentage(data.smile_percentage.toFixed(2));
        setShowUsernameInput(true); // Show username input after smile detection
      } else {
        setError(data.error || 'An error occurred while checking the smile.');
      }
    } catch (err) {
      setError('Failed to connect to the backend.');
    }
  };

  const handleSaveData = async () => {
    if (!username.trim()) {
      setError('Please enter your name.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/save_smile_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          smile_percentage: smilePercentage,
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

  const getColor = (percentage) => {
    if (percentage >= 80) return "#4a90e2";
    if (percentage >= 50) return "green";
    return "red";
  };

  return (
    <div className='main_continer'>
      <div>
        <p className='main_topic'>Action Quest</p>
        <div className='action_card_set'>
          <div className='details_set'>
            <p className='word_name'>SMILE</p><br />
            <img src={Smile} alt='Smile' className='smile_kni' />
          </div>
          <div className='data_set_kin'>
            <div className='by_Image_Section active'>
              <div className="border_card_smile">
                <p className='main_topic_new_sub_add'>Smile Detection By Image</p>
                <input className="file_path" type="file" onChange={handleFileChange} />

                {smilePercentage !== null && (
                  <div className="percentage_container_full_kin">
                    <div className="percentage_column_data">
                      <p>Smile Percentage:</p>
                      <p> {smilePercentage}%</p>
                    </div>
                    <div className="progress-column">
                      <div className="progress_bar_kin" style={{ width: `${smilePercentage}%`, backgroundColor: getColor(smilePercentage) }}></div>
                    </div>
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

                <div className='btn_continer_simele'>
                  <button className="upload_btn_kini" onClick={handleUploadCheck}>Check</button>
                  {smilePercentage !== null && (
                    <>
                    
                    
                    </>
                  )}
                </div>
                {error && <p className="error_message">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmileDetection;
