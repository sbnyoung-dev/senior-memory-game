import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import GuideScreen from './components/GuideScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import { DIFFICULTY_CONFIG } from './hooks/usePuzzleGame';
import { STORAGE_KEY } from '../../pages/AdmissionPage';

const VALID    = ['easy', 'normal', 'hard'];
const CATEGORY = 'spatial';

export default function PuzzleGame() {
  const [searchParams] = useSearchParams();
  const navigate  = useNavigate();
  const autoDiff  = VALID.includes(searchParams.get('difficulty')) ? searchParams.get('difficulty') : null;

  const initialDiff = autoDiff || 'easy';
  const initialTime = DIFFICULTY_CONFIG[initialDiff].timeLimit;

  const [screen,     setScreen]     = useState('guide');
  const [difficulty, setDifficulty] = useState(initialDiff);
  const [round,      setRound]      = useState(1);
  const [timeLeft,   setTimeLeft]   = useState(initialTime);
  const [result,     setResult]     = useState(null);

  const timerRef    = useRef(null);
  const scoresRef   = useRef([]);
  const roundRef    = useRef(1);
  const diffRef     = useRef(initialDiff);
  const timeLeftRef = useRef(initialTime);

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
  }, [screen, finishGame]);

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

  function handleHome() {
    if (result) {
      const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const todayScores = { ...(user.todayScores || {}), [CATEGORY]: result.total };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user, todayScores }));
    }
    navigate('/');
  }

  const cfg = DIFFICULTY_CONFIG[difficulty];

  if (screen === 'guide')  return <GuideScreen onStart={handleStart} lockedDifficulty={autoDiff} />;
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
  if (screen === 'result') return <ResultScreen result={result} onRestart={handleRestart} onHome={handleHome} />;
}
