import React from "react";
import { Route, Routes } from "react-router";
/*Home*/
import Home from "./components/Home/Home";
/*Auditory Learning*/
import AuditoryHomePage from "./components/AuditoryLearning/Home/AuditoryHomePage";
import AudioTranscription from "./components/AuditoryLearning/AudioBook/Speech_Recognise/AudioTranscription";
import InsertLesson from "./components/AuditoryLearning/AudioBook/Admin _panel/Insert_Lessons/InsertLesson";
import AllLessons from "./components/AuditoryLearning/AudioBook/Lessons/LessonsList";
import LessonPage from "./components/AuditoryLearning/AudioBook/Lessons/LessonPage";
/*Knesthetic Learning*/
import SmileDetection from "./components/KnestheticLearning/ActionQuest/SmileDetection";
import KnestheticHome from "./components/KnestheticLearning/KnestheticHome/KnestheticHome";
import LetterQuest from "./components/KnestheticLearning/LetterQuest/LetterQuest";
import Result from "./components/KnestheticLearning/LetterQuest/Result";


const App = () => {
  return (
    <div>
      <React.Fragment>
        <Routes>
          {/*Home*/}
          <Route path="/" element={<Home />} />
          {/* Auditory Learning*/}
          <Route path="/AuditoryHomePage" element={<AuditoryHomePage />} />
          <Route path="/AudioTranscription" element={<AudioTranscription />} />
          <Route path="/InsertLesson" element={<InsertLesson />} />
          <Route path="/AllLessons" element={<AllLessons />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          {/* Knesthetic Learning*/}
          <Route path="/SmileDetection" element={<SmileDetection />} />
          <Route path="/KnestheticHome" element={<KnestheticHome />} />
          <Route path="/LetterQuest" element={<LetterQuest />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </React.Fragment>
    </div>
  );
};

export default App;
