import React from "react";
import { Route, Routes } from "react-router";
/*Auditory Learning*/
import AudioTranscription from "../src/components/AuditoryLearning/AudioBook/AudioTranscription";
import InsertLesson from "../src/components/AuditoryLearning/AudioBook/InsertLesson";
import AllLessons from "../src/components/AuditoryLearning/AudioBook/Lessons/LessonsList";

import SmileDetection from "../src/components/KnestheticLearning/SmileDetection";
/*Knesthetic Learning*/
const App = () => {
  return (
    <div>
      <React.Fragment>
        <Routes>
          {/* Auditory Learning*/}
          <Route path="/AudioTranscription" element={<AudioTranscription />} />
          <Route path="/InsertLesson" element={<InsertLesson />} />
          <Route path="/AllLessons" element={<AllLessons />} />
          {/* Knesthetic Learning*/}
          <Route path="/SmileDetection" element={<SmileDetection />} />
        </Routes>
      </React.Fragment>
    </div>
  );
};

export default App;
