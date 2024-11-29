import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const CameraFeed = ({ setSmileResult }) => {
    const videoRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);

    // Initialize webcam
    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startWebcam();
        return () => {
            // Clean up the stream on component unmount
            if (videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // Capture frame every second and send it to backend for prediction
    const captureFrame = async () => {
        if (videoRef.current && videoRef.current.videoWidth) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');

            // Send image to the backend (make sure the backend is running on localhost or the correct server)
            try {
                const response = await axios.post('http://localhost:5000/predict', { image: imageData });
                setSmileResult(response.data.result); // Set smile result from backend
            } catch (err) {
                console.error("Error sending image to backend:", err);
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(captureFrame, 1000); // 1 second interval
        return () => clearInterval(interval); // Clean up interval on component unmount
    }, []);

    return (
        <div className="camera-container">
            <video ref={videoRef} autoPlay muted />
            {!isStreaming && <p>Loading camera...</p>}
        </div>
    );
};

export default CameraFeed;
