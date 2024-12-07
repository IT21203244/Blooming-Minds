import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [eraseCount, setEraseCount] = useState(0);
  const [undoCount, setUndoCount] = useState(0);
  const [randomLetter, setRandomLetter] = useState("");
  const [drawing, setDrawing] = useState(false);
  const navigate = useNavigate();

  // Generate a random letter on component mount
  useEffect(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    setRandomLetter(letters.charAt(Math.floor(Math.random() * letters.length)));
  }, []);

  // Handle ERASE functionality
  const handleErase = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    setEraseCount(eraseCount + 1); // Increment erase count
  };

  // Handle UNDO functionality (basic clear last stroke)
  const handleUndo = () => {
    setUndoCount(undoCount + 1); // Increment undo count
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas (simplified)
  };

  // Capture the canvas image, send it to the backend, and handle prediction
  const handleDone = async () => {
    const canvas = canvasRef.current;
    const canvasData = canvas.toDataURL("image/png"); // Get canvas data as PNG image

    // Create a blob from the image data URL
    const blob = await (await fetch(canvasData)).blob();

    // Get the current time for time tracking
    const timeTaken = new Date().getTime();

    // Prepare form data for uploading
    const formData = new FormData();
    formData.append("image", blob, `${randomLetter}.png`);
    formData.append("eraseCount", eraseCount);
    formData.append("undoCount", undoCount);
    formData.append("timeTaken", timeTaken);

    try {
      // Send the image and data to the backend
      const response = await axios.post("http://127.0.0.1:5000/read_write_learning/predict_and_compare", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        alert(`Prediction: ${response.data.prediction}`);
        navigate("/analysis"); // Navigate to the analysis page (implementation later)
      }
    } catch (error) {
      console.error("Error saving letter:", error);
      alert("Failed to save the letter. Please try again.");
    }
  };

  // Handle drawing on the canvas
  const handleMouseDown = (e) => {
    setDrawing(true);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (drawing) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.lineWidth = 15;
      context.lineCap = "round";
      context.strokeStyle = "#000";
      context.beginPath();
      context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      context.stroke();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "80%" }}>
        <div>
          <h2>Identify this letter:</h2>
          <div
            style={{
              fontSize: "100px",
              fontWeight: "bold",
              color: "#ff6f61",
              backgroundColor: "#f3f3f3",
              borderRadius: "10px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            {randomLetter}
          </div>
        </div>
        {/* Canvas area where child draws the letter */}
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          style={{ border: "1px solid black", marginTop: "20px", backgroundColor: "#f3f3f3" }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
        <button
          onClick={handleErase}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#ff6f61",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          ERASE
        </button>
        <button
          onClick={handleUndo}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#ff6f61",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          UNDO
        </button>
        <button
          onClick={handleDone}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
};

export default Canvas;
