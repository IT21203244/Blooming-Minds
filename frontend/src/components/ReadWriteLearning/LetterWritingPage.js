import React, { useState, useEffect } from "react";
import axios from "axios";
import './LetterWritingPage.css';

import win from './img/win.png';
import sad from './img/sad.png';

import sun from './img/sun.jpg';
import bfly from './img/bfly.jpg';
import mroom from './img/mroom.jpg';
import rbow from './img/rbow.jpg';
import star from './img/star.jpg';
import cloud from './img/Picture1.png';

function LetterWritingPage() {
  const [image, setImage] = useState(null);
  const [predictedLetter, setPredictedLetter] = useState(null);
  const [systemLetter, setSystemLetter] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [idealImage, setIdealImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mismatch, setMismatch] = useState(false);
  const [match, setMatch] = useState(false);
  const [status, setStatus] = useState(null);
  const [isUppercase, setIsUppercase] = useState(null);

  useEffect(() => {
    const randomLetter = generateRandomLetter();
    setSystemLetter(randomLetter);
  }, []);

  const generateRandomLetter = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return letters.charAt(Math.floor(Math.random() * letters.length));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    setError(null);
    setMismatch(false);
    setMatch(false);
    setStatus(null);
    setIsUppercase(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("system_letter", systemLetter);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/read_write_learning/predict_and_compare",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = response.data;
      if (response.status === 201) {
        setPredictedLetter(data.predicted_letter);
        setAccuracy(data.accuracy);
        setFilePath(data.file_path);
        setIdealImage(data.ideal_image);
        setStatus(data.status);
        setIsUppercase(data.is_uppercase);

        if (data.status === "correct") {
          setMatch(true);
        } else {
          setMismatch(true);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error connecting to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const closeMismatch = () => setMismatch(false);
  const closeMatch = () => setMatch(false);

  return (
    <div className="letter-writing-page">

      <div className="letter-write">
            {/* Floating Image */}
            <img src={sun} alt="Sun" className="floating-image" />
            <img src={bfly} alt="bfly" className="floating-image1" />
            <img src={mroom} alt="mroom" className="floating-image2" />
            <img src={rbow} alt="rbow" className="floating-image3" />
            <img src={star} alt="star" className="floating-image4" />
            <img src={cloud} alt="cloud" className="floating-image5" />

            <div className="sidebar"></div>
              <div className="mainh"><h1>Letter Writing Recognition</h1></div>
            <div>
              <h3>System Generated Letter: {systemLetter}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <input type="file" onChange={handleImageChange} accept="image/*" />
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Submit"}
              </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {predictedLetter && (
              <div className="inner-texts">
                <p>Predicted Letter: {predictedLetter}</p>
                <p>Accuracy: {accuracy.toFixed(2)}%</p>
                <p>File Path: {filePath}</p>
                <p>{isUppercase ? "It is an uppercase letter!" : "It is a lowercase letter."}</p>
                <div>
                  <h4>Ideal Letter:</h4>
                  <img
                    src={`data:image/png;base64,${idealImage}`}
                    alt="Ideal Letter"
                    style={{ border: "1px solid black", padding: "5px" }}
                  />
                </div>
                <p>Status: {status === "correct" ? "Correct" : "Incorrect"}</p>
              </div>
            )}
            {mismatch && (
              <div className="popup mismatch">
                <div className="popup-content">
                  <img src={sad} alt="Error" />
                  <p>Oops! The letter you wrote doesn't match the system letter. Try again!</p>
                  <button onClick={closeMismatch}>Close</button>
                </div>
              </div>
            )}
            {match && (
              <div className="popup match">
                <div className="popup-content">
                  <img src={win} alt="Success" />
                  <p>🎉 Congratulations! The letter matches perfectly! 🎉</p>
                  <button onClick={closeMatch}>Close</button>
                </div>
              </div>
            )}
          </div>
    </div>
    
  );
}

export default LetterWritingPage;
