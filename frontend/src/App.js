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
import Transcription from "./components/AuditoryLearning/AudioBook/Speech_Recognise/AudioTranscription";


/*Knesthetic Learning*/
import SmileDetection from "./components/KnestheticLearning/ActionQuest/SmileDetection";
import KnestheticHome from "./components/KnestheticLearning/KnestheticHome/KnestheticHome";
import LetterQuest from "./components/KnestheticLearning/LetterQuest/LetterQuest";
import Result from "./components/KnestheticLearning/LetterQuest/Result";
import AddRecord from "./components/KnestheticLearning/LetterQuest/AddRecord";
import AdminDashKnesthetic from "./components/KnestheticLearning/Admin/AdminDashKnesthetic";
import RecordAnalysisKnesthetic from "./components/KnestheticLearning/Admin/RecordAnalysisKnesthetic";
import SkilCompareKnesthetic from "./components/KnestheticLearning/Admin/SkilCompareKnesthetic";


/*ReadWrite Learning*/
import ReadWriteHomePage from "./components/ReadWriteLearning/ReadWriteHomePage"; 
import LetterWritingPage from "./components/ReadWriteLearning/LetterWritingPage"; 
import UserLettersPage from "./components/ReadWriteLearning/UserLettersPage";
import Canvas from "./components/ReadWriteLearning/canvas";
import LetterAnalysisPage from "./components/ReadWriteLearning/LetterAnalysisPage";


/*Visual Learning*/
import VisualHomePage from "./components/VisualLearning/VisualHomePage";
import ColorMatchingHome from "./components/VisualLearning/ColorMatchingHome";
import ColorMatchingGame from "./components/VisualLearning/ColorMatchingGame";
import FetchColorMatchingData from "./components/VisualLearning/FetchColorMatchingData";
import FetchColorMatchingReport from "./components/VisualLearning/FetchColorMatchingReport";
import ProgressDashboard from "./components/VisualLearning/ProgressDashboard";


/*Auth SignIn SignUp*/
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import PrivateRoute from "./components/Auth/PrivateRoute";


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
          <Route path="/Transcription" element={< Transcription />} />
         
          {/* Knesthetic Learning*/}
          <Route path="/SmileDetection" element={<SmileDetection />} />
          <Route path="/KnestheticHome" element={<KnestheticHome />} />
          <Route path="/LetterQuest" element={<LetterQuest />} />
          <Route path="/result" element={<Result />} />
          <Route path="/saveRecordLetter" element={<AddRecord />} />
          <Route path="/KnestheticAdmin" element={<AdminDashKnesthetic />} />
          <Route path="/recordAnalysisKnesthetic" element={<RecordAnalysisKnesthetic />} />
          <Route path="/skilCompareKnesthetic" element={<SkilCompareKnesthetic />} />

          {/* ReadWrite Learning */}
          <Route path="/rw-home" element={<ReadWriteHomePage />} />
          <Route path="/letter-writing" element={<LetterWritingPage />} />
          <Route path="/user-letters/:userId" element={<UserLettersPage />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/analysis/:userId/:letter" element={<LetterAnalysisPage />} />

          {/* Visual Learning */}
          <Route path="/v-home" element={<VisualHomePage/>} />
          <Route path="/color-matching" element={<ColorMatchingHome/>} />
          <Route path="/color-matching-game/:level" element={<ColorMatchingGame />} />
          <Route path="/color-matching-data" element={<FetchColorMatchingData />} />
          <Route path="/color-matching-report" element={<FetchColorMatchingReport />} />
          <Route path="/progress-dashboard" element={<ProgressDashboard />} />

          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </React.Fragment>
    </div>
  );
};

export default App;
