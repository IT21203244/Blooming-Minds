import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CCS/LessonPage.css";

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image";
  let audioPlayer = null; // Store audio object

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/get_lesson/${lessonId}`)
      .then((response) => {
        const lessonData = response.data.lesson;
        if (lessonData && lessonData.audio_files) {
          // Convert stored relative paths to absolute URLs
          lessonData.audio_files = lessonData.audio_files.map(
            (file) => `http://localhost:5000/${file}`
          );          
        }
        setLesson(lessonData);
      })
      .catch(() => setError("Failed to fetch lesson."));
  }, [lessonId]);

  const playAudio = (index = 0) => {
    if (!lesson || !lesson.audio_files || lesson.audio_files.length === 0) {
      return;
    }

    if (index >= lesson.audio_files.length) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setCurrentAudioIndex(index);

    const audio = new Audio(lesson.audio_files[index]);
    audio.playbackRate = audioSpeed;

    audio.onended = () => {
      playAudio(index + 1); // Play next audio file
    };

    audio.onerror = () => {
      console.error("Failed to load audio file:", lesson.audio_files[index]);
      setIsPlaying(false);
    };

    audio.play();
    audioPlayer = audio;
  };

  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
    setIsPlaying(false);
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!lesson) return <p className="loading-message">Loading...</p>;

  return (
    <div className="lesson-page">
      <h2 className="lesson-title">{lesson.title}</h2>
      <img
        src={lesson.imageURL || DEFAULT_IMAGE_URL}
        alt={lesson.title}
        className="lesson-image"
      />
      <p className="lesson-text">
        {lesson.text}
      </p>

      {/* Display Audio Files */}
      {lesson.audio_files && lesson.audio_files.length > 0 && (
        <div className="audio-files">
          <h3>Lesson Audio</h3>
          {lesson.audio_files.map((audioFile, index) => (
            <div key={index} className="audio-file">
              <audio controls>
                <source src={audioFile} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>
      )}

      <div className="controls">
        <button className="control-button" onClick={() => playAudio()} disabled={isPlaying}>
          Play All
        </button>
        <button className="control-button" onClick={stopAudio} disabled={!isPlaying}>
          Stop
        </button>
      </div>

      <div className="speed-control">
        <label>Audio Speed</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={audioSpeed}
          onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default LessonPage;
