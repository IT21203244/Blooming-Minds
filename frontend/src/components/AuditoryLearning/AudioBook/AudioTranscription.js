import React, { useState } from "react";
import axios from "axios";

const AudioTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    setError("");
    setTranscription("");
    setIsLoading(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("file", audioBlob, "recorded_audio.wav");

          axios
            .post("http://localhost:5000/record", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
              setIsRecording(false);
              setIsLoading(false);
              setTranscription(response.data.transcription);
            })
            .catch(() => {
              setError("Failed to transcribe audio.");
              setIsRecording(false);
              setIsLoading(false);
            });
        };

        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);
      })
      .catch(() => {
        setError("Failed to access the microphone.");
        setIsRecording(false);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <h1>Audio Transcription</h1>
      <button onClick={startRecording} disabled={isRecording || isLoading}>
        {isRecording ? "Recording..." : "Start Recording"}
      </button>
      {isLoading && <p>Transcribing...</p>}
      {transcription && (
        <div>
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AudioTranscription;
