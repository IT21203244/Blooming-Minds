import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Action.css';
import Smile from './img/smile.jpeg';

const SmileDetection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const [imagePath, setImagePath] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [smilePercentage, setSmilePercentage] = useState(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('image'); // Default to image section

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

  const handleStartCamera = async () => {
    try {
      const response = await fetch('http://localhost:5000/video_feed', { method: 'HEAD' });
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
      } else {
        setError(data.error || 'An error occurred while checking the smile.');
      }
    } catch (err) {
      setError('Failed to connect to the backend.');
    }
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
  };
  const getColor = (percentage) => {
    if (percentage >= 80) {
      return "#4a90e2"; // Blue for 80% or above
    } else if (percentage >= 50) {
      return "green"; // Green for 50% or above
    } else {
      return "red"; // Red for less than 50%
    }
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
            <div className=''>
              <div>
                <div className='new_nav_barkin'>
                  <p
                    onClick={() => handleNavClick('image')}
                    className={`nav_item_check ${activeSection === 'image' ? 'active' : ''}`}
                  >
                    By Image
                  </p>
                  <p
                    onClick={() => handleNavClick('camera')}
                    className={`nav_item_check ${activeSection === 'camera' ? 'active' : ''}`}
                  >
                    By Camera
                  </p>
                </div>
                <div className={`by_Image_Section ${activeSection === 'image' ? 'active' : ''}`}>
                  <div className="border_card_smile">
                    <div>
                      <p className='main_topic_new_sub_add'>Smile Detection By Image</p>
                      <input
                        className="file_path"
                        type="file"
                        onChange={handleFileChange}
                      />
                      {smilePercentage !== null && (
                        <div className="percentage_container_full_kin">
                          <div className="percentage_column_data">
                            <p>Smile Percentage:</p><p> {smilePercentage}%</p>
                          </div>
                          <div className="progress-column">
                            <div
                              className="progress_bar_kin"
                              style={{
                                width: `${smilePercentage}%`,
                                backgroundColor: getColor(smilePercentage),

                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {uploadedImage && (
                        <div className='image_kin_set'>
                          <p className='up_img_topic'>Uploaded Image:</p>
                          <img
                            src={URL.createObjectURL(uploadedImage)}
                            alt="Uploaded"
                            className="uploaded_image"
                          />
                        </div>
                      )}
                      <button className="upload_btn_kini" onClick={handleUploadCheck}>
                        Check
                      </button>

                      {error && <p className="error_message">{error}</p>}
                    </div>
                  </div>
                </div>
                <div className={`by_Camara_Section ${activeSection === 'camera' ? 'active' : ''}`}>
                  <div className='border_card_smile'>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmileDetection;
