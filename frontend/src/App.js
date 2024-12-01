import React from "react";
import { Route, Routes } from "react-router";
/*Home*/
import Home from "./components/Home/Home";
/*Auditory Learning*/
import AudioTranscription from "../src/components/AuditoryLearning/AudioBook/AudioTranscription";
import InsertLesson from "../src/components/AuditoryLearning/AudioBook/InsertLesson";
import AllLessons from "../src/components/AuditoryLearning/AudioBook/Lessons/LessonsList";
/*Knesthetic Learning*/
import SmileDetection from "./components/KnestheticLearning/ActionQuest/SmileDetection";
import KnestheticHome from "./components/KnestheticLearning/KnestheticHome/KnestheticHome";


const App = () => {
  return (
    <div>
      <React.Fragment>
        <Routes>
          {/*Home*/}
          <Route path="/" element={<Home />} />
          {/* Auditory Learning*/}
          <Route path="/AudioTranscription" element={<AudioTranscription />} />
          <Route path="/InsertLesson" element={<InsertLesson />} />
          <Route path="/AllLessons" element={<AllLessons />} />
          {/* Knesthetic Learning*/}
          <Route path="/SmileDetection" element={<SmileDetection />} />
          <Route path="/KnestheticHome" element={<KnestheticHome />} />
        </Routes>
      </React.Fragment>
    </div>
  );
};

export default App;
