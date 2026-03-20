import { useState, useEffect, useRef, useCallback } from 'react';
import GuideScreen from './components/GuideScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import { DIFFICULTY_CONFIG } from './hooks/usePuzzleGame';

export default function PuzzleGame() {
  const [screen,      setScreen]      = useState('guide');
  const [difficulty,  setDifficulty]  = useState('easy');
  const [round,       setRound]       = useState(1);
  const [timeLeft,    setTimeLeft]    = useState(90);
  const [result,      setResult]      = useState(null);

  // refs — closures 안에서 최신값 접근
  const timerRef    = useRef(null);
  const scoresRef   = useRef([]);
  const roundRef    = useRef(1);
  const diffRef     = useRef('easy');
  const timeLeftRef = useRef(90);

  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  const finishGame = useCallback((scores) => {
    clearInterval(timerRef.current);
    const cfg = DIFFICULTY_CONFIG[diffRef.current];
    const n   = scores.length;
    if (n === 0) {
      setResult({ total: 0, accuracy: 0, speed: 0, efficiency: 0, roundsCompleted: 0, totalRounds: cfg.rounds });
    } else {
      const sum = scores.reduce((a, s) => ({
        accuracy:   a.accuracy   + s.accuracy,
        speed:      a.speed      + s.speed,
        efficiency: a.efficiency + s.efficiency,
        total:      a.total      + s.total,
      }), { accuracy: 0, speed: 0, efficiency: 0, total: 0 });
      setResult({
        total:           Math.round(sum.total      / n),
        accuracy:        Math.round(sum.accuracy   / n),
        speed:           Math.round(sum.speed      / n),
        efficiency:      Math.round(sum.efficiency / n),
        roundsCompleted: n,
        totalRounds:     cfg.rounds,
      });
    }
    setScreen('result');
  }, []);

  // 타이머 — screen이 'game'이 될 때 한 번 시작, 라운드 변경 시 유지
  useEffect(() => {
    if (screen !== 'game') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishGame(scoresRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, finishGame]); // screen이 'game'으로 바뀔 때만 실행

  const handleStart = (diff) => {
    const cfg = DIFFICULTY_CONFIG[diff];
    diffRef.current   = diff;
    scoresRef.current = [];
    roundRef.current  = 1;
    setDifficulty(diff);
    setRound(1);
    setTimeLeft(cfg.timeLimit);
    setScreen('game');
  };

  const handleRoundComplete = useCallback((roundScore) => {
    const newScores = [...scoresRef.current, roundScore];
    scoresRef.current = newScores;
    const cfg = DIFFICULTY_CONFIG[diffRef.current];
    if (roundRef.current >= cfg.rounds) {
      finishGame(newScores);
    } else {
      roundRef.current += 1;
      setRound(r => r + 1);
    }
  }, [finishGame]);

  const handleRestart = useCallback(() => {
    clearInterval(timerRef.current);
    scoresRef.current = [];
    roundRef.current  = 1;
    setResult(null);
    setRound(1);
    setScreen('guide');
  }, []);

  const cfg = DIFFICULTY_CONFIG[difficulty];

  if (screen === 'guide')  return <GuideScreen onStart={handleStart} />;
  if (screen === 'game')   return (
    <GameScreen
      key={difficulty + '-' + round}
      difficulty={difficulty}
      round={round}
      totalRounds={cfg.rounds}
      timeLeft={timeLeft}
      onRoundComplete={handleRoundComplete}
      onQuit={handleRestart}
    />
  );
  if (screen === 'result') return <ResultScreen result={result} onRestart={handleRestart} />;
}
