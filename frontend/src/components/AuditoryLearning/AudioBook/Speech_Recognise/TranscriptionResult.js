import React from "react";

const TranscriptionResult = ({ transcription }) => (
  <div className="transcription-result">
    <h2>Transcription Result:</h2>
    <p>{transcription}</p>
  </div>
);

export default TranscriptionResult;