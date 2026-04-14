import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { STORAGE_KEY } from './pages/AdmissionPage';
import Home from './pages/Home';
import AdmissionPage from './pages/AdmissionPage';
import EntranceExamPage from './pages/EntranceExamPage';
import AdmissionResultPage from './pages/AdmissionResultPage';
import MemoryCardGame from './games/memory-card';
import StroopGame from './games/stroop';
import ChosungGame from './games/chosung';
import PuzzleGame from './games/puzzle';
import TrafficGame from './games/traffic';
import BunsikGame from './games/bunsik';
import DailyReportPage from './pages/DailyReportPage';
import ChildSafetyReportPage from './pages/ChildSafetyReportPage';

// 루트 진입 시 로컬 스토리지 상태에 따라 분기
function RootRedirect() {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (!user)        return <Navigate to="/admission" replace />;
  if (!user.grade)  return <Navigate to="/exam"      replace />;
  return <Home />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<RootRedirect />} />
        <Route path="/admission"      element={<AdmissionPage />} />
        <Route path="/exam"             element={<EntranceExamPage />} />
        <Route path="/admission-result" element={<AdmissionResultPage />} />
        <Route path="/memory-card"    element={<MemoryCardGame />} />
        <Route path="/stroop"         element={<StroopGame />} />
        <Route path="/chosung"        element={<ChosungGame />} />
        <Route path="/puzzle"         element={<PuzzleGame />} />
        <Route path="/traffic"        element={<TrafficGame />} />
        <Route path="/bunsik"               element={<BunsikGame />} />
        <Route path="/daily-report"         element={<DailyReportPage />} />
        <Route path="/child-safety-report"  element={<ChildSafetyReportPage />} />
        <Route path="*"                     element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
