import React, { useState } from "react";
import axios from "axios";
import TranscriptionResult from "../TranscriptionResult";

const AudioRecorder = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const handleTranscription = async () => {
    if (!audioFile) {
      alert("Please upload an audio file!");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", audioFile);

    try {
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error("Error during transcription:", error);
      alert("Failed to transcribe audio.");
    }
    setIsLoading(false);
  };

  return (
    <div className="audio-recorder">
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      <button onClick={handleTranscription} disabled={isLoading}>
        {isLoading ? "Transcribing..." : "Transcribe"}
      </button>
      {transcription && <TranscriptionResult transcription={transcription} />}
    </div>
  );
};