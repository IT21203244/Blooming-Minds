import React from "react";
import { Route, Routes } from "react-router";
/*Home*/
import Home from "./components/Home/Home";
/*Auditory Learning*/
import AuditoryHomePage from "./components/AuditoryLearning/Home/AuditoryHomePage";
import AudioTranscription from "./components/AuditoryLearning/AudioBook/Speech_Recognise/AudioTranscription";
import InsertLesson from "./components/AuditoryLearning/Admin_Panel/InsertAudioBook/InsertLesson";
import AllLessons from "./components/AuditoryLearning/AudioBook/Lessons/LessonsList";
import LessonPage from "./components/AuditoryLearning/AudioBook/Lessons/LessonPage";
import InsertAudioGame from "./components/AuditoryLearning/Admin_Panel/InsertGame/AudiogameForm";
import AllAudioGames from "./components/AuditoryLearning/AudioGame/Game/Audiogame";
import LessonResults from "./components/AuditoryLearning/Analysis/GameResult/LessonResults";
import AdminHome from "./components/AuditoryLearning/Admin_Panel/AdminHome/AdminHome"; 

/*Knesthetic Learning*/
import SmileDetection from "./components/KnestheticLearning/ActionQuest/SmileDetection";
import KnestheticHome from "./components/KnestheticLearning/KnestheticHome/KnestheticHome";
import LetterQuest from "./components/KnestheticLearning/LetterQuest/LetterQuest";
import Result from "./components/KnestheticLearning/LetterQuest/Result";
import AddRecord from "./components/KnestheticLearning/LetterQuest/AddRecord";
import AdminDashKnesthetic from "./components/KnestheticLearning/Admin/AdminDashKnesthetic";
import RecordAnalysisKnesthetic from "./components/KnestheticLearning/Admin/RecordAnalysisKnesthetic";
import SkilCompareKnesthetic from "./components/KnestheticLearning/Admin/SkilCompareKnesthetic";


const App = () => {
  return (
    <div>
      <React.Fragment>
        <Routes>
          {/*Home*/}
          <Route path="/" element={<Home />} />
          {/* Auditory Learning*/}
          <Route path="/AuditoryHomePage" element={<AuditoryHomePage />} />
          <Route path="/AdminHome" element={<AdminHome />} />
          <Route path="/AudioTranscription" element={<AudioTranscription />} />
          <Route path="/InsertLesson" element={<InsertLesson />} />
          <Route path="/AllLessons" element={<AllLessons />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/InsertAudioGame" element={<InsertAudioGame />} />
          <Route path="/audiogames" element={< AllAudioGames />} />
          <Route path="/LessonResults" element={< LessonResults />} />
         
          {/* Knesthetic Learning*/}
          <Route path="/SmileDetection" element={<SmileDetection />} />
          <Route path="/KnestheticHome" element={<KnestheticHome />} />
          <Route path="/LetterQuest" element={<LetterQuest />} />
          <Route path="/result" element={<Result />} />
          <Route path="/saveRecordLetter" element={<AddRecord />} />
          <Route path="/KnestheticAdmin" element={<AdminDashKnesthetic />} />
          <Route path="/recordAnalysisKnesthetic" element={<RecordAnalysisKnesthetic />} />
          <Route path="/skilCompareKnesthetic" element={<SkilCompareKnesthetic />} />
        </Routes>
      </React.Fragment>
    </div>
  );
};

export default App;
