import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import "./LetterWritingPage.css";
import LetterSelection from "./LetterSelection"; // Import the new component

import sun from "./img/sun3.png";
import bfly from "./img/bfly1.png";
import mroom from "./img/mroom1.png";
import rbow from "./img/rbow1.png";
import star from "./img/star1.png";
import cloud from "./img/c1.png";

function LetterWritingPage() {
  const canvasRef = useRef(null);
  const [systemLetter, setSystemLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictedLetter, setPredictedLetter] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [idealImage, setIdealImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [penSize, setPenSize] = useState(9);
  const [showPopup, setShowPopup] = useState(false);
  const [referenceData, setReferenceData] = useState({
    picImageUrl: null,
    videoUrl: null,
  });

  // Fetch reference data when a letter is selected
  const fetchReferenceData = async (letter, letterCase) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "http://127.0.0.1:5000/read_write_learning/get_ideal_letter_data",
        {
          params: {
            system_letter: letter,
            case: letterCase,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setReferenceData({
          picImageUrl: response.data.pic_image_url,
          videoUrl: response.data.video_url,
        });
      }
    } catch (err) {
      console.error("Error fetching reference data:", err);
      setError("Failed to load reference materials.");
    }
  };

  // Handle letter selection
  const handleLetterSelect = (letter) => {
    setSystemLetter(letter);
    const letterCase = letter === letter.toUpperCase() ? "uppercase" : "lowercase";
    fetchReferenceData(letter, letterCase);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const canvas = canvasRef.current;
    try {
      const canvasScreenshot = await html2canvas(canvas);
      const dataURL = canvasScreenshot.toDataURL("image/png");

      const formData = new FormData();
      formData.append("image", dataURL);
      formData.append("system_letter", systemLetter);
      const letterCase =
        systemLetter === systemLetter.toUpperCase() ? "uppercase" : "lowercase";
      formData.append("case", letterCase);

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://127.0.0.1:5000/read_write_learning/predict_and_compare",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        const data = response.data;
        setPredictedLetter(data.predicted_letter);
        setAccuracy(data.accuracy);
        if (data.ideal_image_url) {
          setIdealImage(data.ideal_image_url);
        }
        setStatus(data.status);
        setShowPopup(true);
      }
    } catch (err) {
      setError("Error connecting to the backend or invalid token.");
    } finally {
      setLoading(false);
    }
  };

  const drawOnCanvas = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.buttons === 1) {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(x, y, penSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const handlePenSizeChange = (event) => {
    setPenSize(parseInt(event.target.value));
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="jlw-letter-writing-page">
      <img src={sun} alt="Sun" className="jlw-floating-image" />
      <img src={bfly} alt="bfly" className="jlw-floating-image1" />
      <img src={mroom} alt="mroom" className="jlw-floating-image2" />
      <img src={rbow} alt="rbow" className="jlw-floating-image3" />
      <img src={star} alt="star" className="jlw-floating-image4" />
      <img src={cloud} alt="cloud" className="jlw-floating-image5" />

      <div className="jlw-letter-write">
        <h1>Letter Writing Recognition</h1>

        {/* Letter Selection Component */}
        <LetterSelection onLetterSelect={handleLetterSelect} />

        {/* Display Selected Letter */}
        {systemLetter && <h3>Selected Letter: {systemLetter}</h3>}

        {/* Reference Section - Two Columns */}
        <div className="jlw-reference-section">
          {referenceData.picImageUrl && (
            <div className="jlw-reference-column">
              <h4>Reference Image</h4>
              <img src={referenceData.picImageUrl} alt="Letter example" />
            </div>
          )}
          {referenceData.videoUrl && (
            <div className="jlw-reference-column">
              <h4>Reference Video</h4>
              <video src={referenceData.videoUrl} controls muted />
            </div>
          )}
        </div>

        {/* Canvas Section */}
        <div className="jlw-wooden-border">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseMove={drawOnCanvas}
            className="jlw-canvas-style"
          ></canvas>
        </div>

        {/* Pen Size Controls */}
        <div className="jlw-pen-size-container">
          <label>Pen Size: </label>
          <input
            type="range"
            min="1"
            max="20"
            value={penSize}
            onChange={handlePenSizeChange}
          />
          <span>{penSize}px</span>
        </div>

        {/* Buttons */}
        <button onClick={clearCanvas}>Clear Canvas</button>
        <form onSubmit={handleSubmit}>
          <button type="submit" disabled={loading || !systemLetter}>
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="jlw-error">{error}</p>}
      </div>

      {/* Popup for Results */}
      {showPopup && (
        <div className="jlw-popup">
          <div className="jlw-popup-content">
            <h2>Result</h2>
            <p>Predicted Letter: {predictedLetter}</p>
            <p>Accuracy: {accuracy}%</p>
            {idealImage && (
              <div>
                <h3>Ideal Letter Image</h3>
                <img src={idealImage} alt="Ideal Letter" />
              </div>
            )}
            <p>Status: {status}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LetterWritingPage;