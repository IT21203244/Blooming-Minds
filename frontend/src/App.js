import React from "react";
import AudioTranscription from "../src/components/AuditoryLearning/AudioBook/AudioTranscription";
import InsertLesson from "../src/components/AuditoryLearning/AudioBook/InsertLesson";
import AllLessons from "../src/components/AuditoryLearning/AudioBook/Lessons/LessonsList";
import { Route, Routes } from "react-router";
const App = () => {
  return (
    <div>
      <h1>Lesson Manager</h1>


      <React.Fragment>
        <Routes>

          {/* Auditory Learning*/}
          <Route path="/AudioTranscription" element={<AudioTranscription />} />
          <Route path="/InsertLesson" element={<InsertLesson />} />
          <Route path="/AllLessons" element={<AllLessons />} />


        </Routes>
        </React.Fragment>
    </div>
  );
};

export default App;
