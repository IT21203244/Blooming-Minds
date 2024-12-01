import React from "react";
import AudioTranscription from "./components/AuditoryLearning/AudioBook/Speech_Recognise/AudioTranscription";
import InsertLesson from "../src/components/AuditoryLearning/AudioBook/admin _panel/Insert_Lessons/InsertLesson";
import AllLessons from "../src/components/AuditoryLearning/AudioBook/Lessons/LessonsList";
import LessonPage from "../src/components/AuditoryLearning/AudioBook/Lessons/LessonPage";
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
          <Route path="/lesson/:lessonId" element={<LessonPage />} />


        </Routes>
        </React.Fragment>
    </div>
  );
};

export default App;
