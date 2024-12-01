import React from "react";
<<<<<<< HEAD
import AudioTranscription from "./components/AuditoryLearning/AudioBook/Speech_Recognise/AudioTranscription";
import InsertLesson from "../src/components/AuditoryLearning/AudioBook/admin _panel/Insert_Lessons/InsertLesson";
=======
import { Route, Routes } from "react-router";
/*Home*/
import Home from "./components/Home/Home";
/*Auditory Learning*/
import AudioTranscription from "../src/components/AuditoryLearning/AudioBook/AudioTranscription";
import InsertLesson from "../src/components/AuditoryLearning/AudioBook/InsertLesson";
>>>>>>> ee80a4719b052dd1571989d747bf3adbe2ed9c1c
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
