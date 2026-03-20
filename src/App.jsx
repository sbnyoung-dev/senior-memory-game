import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MemoryCardGame from './games/memory-card';
import StroopGame from './games/stroop';
import ChosungGame from './games/chosung';
import PuzzleGame from './games/puzzle';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/memory-card" element={<MemoryCardGame />} />
        <Route path="/stroop" element={<StroopGame />} />
        <Route path="/chosung" element={<ChosungGame />} />
        <Route path="/puzzle" element={<PuzzleGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
