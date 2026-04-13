import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import GuideScreen from './components/GuideScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import { STORAGE_KEY } from '../../pages/AdmissionPage';

const VALID    = ['easy', 'normal', 'hard'];
const CATEGORY = 'executive';

export default function TrafficGame() {
  const [searchParams] = useSearchParams();
  const navigate  = useNavigate();
  const autoDiff  = VALID.includes(searchParams.get('difficulty')) ? searchParams.get('difficulty') : null;

  const [screen,     setScreen]     = useState('guide');
  const [difficulty, setDifficulty] = useState(autoDiff || 'easy');
  const [result,     setResult]     = useState(null);

  const handleStart   = (diff) => { setDifficulty(diff); setScreen('game'); };
  const handleGameEnd = (r)    => { setResult(r); setScreen('result'); };
  const handleRestart = ()     => { setResult(null); setScreen('guide'); };

  function handleHome() {
    if (result) {
      const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const todayScores = { ...(user.todayScores || {}), [CATEGORY]: result.total };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user, todayScores }));
    }
    navigate('/');
  }

  if (screen === 'guide')  return <GuideScreen onStart={handleStart} lockedDifficulty={autoDiff} />;
  if (screen === 'game')   return (
    <GameScreen
      key={difficulty + Date.now()}
      difficulty={difficulty}
      onEnd={handleGameEnd}
      onQuit={handleRestart}
    />
  );
  if (screen === 'result') return <ResultScreen result={result} onRestart={handleRestart} onHome={handleHome} />;
}
