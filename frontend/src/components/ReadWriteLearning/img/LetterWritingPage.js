import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import "./LetterWritingPage.css";

import sun from './img/sun3.png';
import bfly from './img/bfly1.png';
import mroom from './img/mroom1.png';
import rbow from './img/rbow1.png';
import star from './img/star1.png';
import cloud from './img/c1.png';

function LetterWritingPage() {
  const canvasRef = useRef(null);
  const [systemLetter, setSystemLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictedLetter, setPredictedLetter] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [idealImage, setIdealImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [match, setMatch] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  useEffect(() => {
    const generateRandomLetter = () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      return letters.charAt(Math.floor(Math.random() * letters.length));
    };
    setSystemLetter(generateRandomLetter());
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Capture the canvas as a screenshot
    const canvas = canvasRef.current;
    try {
      const canvasScreenshot = await html2canvas(canvas);
      const dataURL = canvasScreenshot.toDataURL("image/png");

      const formData = new FormData();
      formData.append("image", dataURL);
      formData.append("system_letter", systemLetter);

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
        setIdealImage(data.ideal_image);
        setStatus(data.status);

        if (data.status === "correct") {
          setMatch(true);
          setMismatch(false);
        } else {
          setMatch(false);
          setMismatch(true);
        }
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
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  return (
    <div className="letter-writing-page">
      <img src={sun} alt="Sun" className="floating-image" />
      <img src={bfly} alt="bfly" className="floating-image1" />
      <img src={mroom} alt="mroom" className="floating-image2" />
      <img src={rbow} alt="rbow" className="floating-image3" />
      <img src={star} alt="star" className="floating-image4" />
      <img src={cloud} alt="cloud" className="floating-image5" />

      <div className="letter-write">
        <h1>Letter Writing Recognition</h1>
        <h3>System Generated Letter: {systemLetter}</h3>

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onMouseMove={drawOnCanvas}
          style={{ border: "1px solid black", marginBottom: "10px" }}
        ></canvas>
        <div>
          <button onClick={clearCanvas}>Clear Canvas</button>
        </div>

        <form onSubmit={handleSubmit}>
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {predictedLetter && (
          <div>
            <p>Predicted Letter: {predictedLetter}</p>
            <p>Accuracy: {accuracy?.toFixed(2)}%</p>
            <img
              src={`data:image/png;base64,${idealImage}`}
              alt="Ideal Letter"
              style={{ border: "1px solid black", padding: "5px" }}
            />
            <p>Status: {status}</p>
          </div>
        )}
        {match && <div>🎉 The letter matches perfectly!</div>}
        {mismatch && <div>😞 The letters do not match. Try again!</div>}
      </div>
    </div>
  );
}

export default LetterWritingPage;
