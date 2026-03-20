import { useState } from 'react';
import GuideScreen from './components/GuideScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

export default function ChosungGame() {
  const [screen, setScreen] = useState('guide'); // 'guide' | 'game' | 'result'
  const [difficulty, setDifficulty] = useState('easy');
  const [result, setResult] = useState(null);

  const handleStart = (diff) => {
    setDifficulty(diff);
    setScreen('game');
  };

  const handleGameEnd = (gameResult) => {
    setResult(gameResult);
    setScreen('result');
  };

  const handleRestart = () => {
    setResult(null);
    setScreen('guide');
  };

  if (screen === 'guide') {
    return <GuideScreen onStart={handleStart} />;
  }
  if (screen === 'game') {
    return (
      <GameScreen
        key={difficulty + Date.now()}
        difficulty={difficulty}
        onEnd={handleGameEnd}
        onQuit={handleRestart}
      />
    );
  }
  if (screen === 'result') {
    return <ResultScreen result={result} onRestart={handleRestart} />;
  }
}
