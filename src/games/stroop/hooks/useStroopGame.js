import { useState, useEffect, useRef, useCallback } from 'react';

export const DIFFICULTY_CONFIG = {
  easy: {
    label: '초급',
    colors: ['빨강', '파랑', '초록', '노랑'],
    colorValues: { 빨강: '#E53935', 파랑: '#1E88E5', 초록: '#43A047', 노랑: '#F9A825' },
    matchRate: 0,
    timeLabel: '60초',
  },
  normal: {
    label: '중급',
    colors: ['빨강', '파랑', '초록', '노랑', '보라'],
    colorValues: { 빨강: '#E53935', 파랑: '#1E88E5', 초록: '#43A047', 노랑: '#F9A825', 보라: '#8E24AA' },
    matchRate: 0.2,
    timeLabel: '60초',
  },
  hard: {
    label: '고급',
    colors: ['빨강', '파랑', '초록', '노랑', '보라', '검정'],
    colorValues: { 빨강: '#E53935', 파랑: '#1E88E5', 초록: '#43A047', 노랑: '#F9A825', 보라: '#8E24AA', 검정: '#212121' },
    matchRate: 0.3,
    timeLabel: '60초',
  },
};

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 60;

function generateQuestion(config, matchRate) {
  const { colors } = config;
  const word = colors[Math.floor(Math.random() * colors.length)];
  let inkColor;
  if (Math.random() < matchRate) {
    inkColor = word;
  } else {
    const others = colors.filter((c) => c !== word);
    inkColor = others[Math.floor(Math.random() * others.length)];
  }
  return { word, inkColor };
}

export function useStroopGame(difficulty) {
  const cfg = DIFFICULTY_CONFIG[difficulty];

  const [questions] = useState(() =>
    Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion(cfg, cfg.matchRate))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [status, setStatus] = useState('playing'); // 'playing' | 'timeout'
  const [feedback, setFeedback] = useState(null); // { selected, correct }
  const answeredRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  // 타이머
  useEffect(() => {
    if (status !== 'playing') return;
    if (timeLeft <= 0) {
      setStatus('timeout');
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, status]);

  const handleAnswer = useCallback((selected) => {
    if (status !== 'playing' || answeredRef.current || feedback) return;
    answeredRef.current = true;

    const correct = questions[currentIndex].inkColor;
    const isCorrect = selected === correct;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setFeedback({ selected, correct, isCorrect });

    setTimeout(() => {
      setFeedback(null);
      answeredRef.current = false;
      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        setStatus('done');
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, isCorrect ? 700 : 1000);
  }, [status, feedback, questions, currentIndex]);

  // 게임 종료 시 status → 'done'도 처리
  useEffect(() => {
    if (status === 'done') return;
  }, [status]);

  const calculateScore = useCallback(() => {
    const elapsed = Math.min((Date.now() - startTimeRef.current) / 1000, TIME_LIMIT);
    const answered = currentIndex + (status === 'playing' ? 0 : 1);
    const accuracyRaw = answered > 0 ? correctCount / answered : 0;
    const accuracy = Math.round(accuracyRaw * 60);
    const speedRatio = status === 'timeout'
      ? correctCount / TOTAL_QUESTIONS
      : Math.max(0, (TIME_LIMIT - elapsed) / TIME_LIMIT);
    const speed = Math.max(8, Math.round(speedRatio * 25));
    const efficiency = Math.max(5, Math.round((correctCount / TOTAL_QUESTIONS) * 15));
    const total = Math.min(100, accuracy + speed + efficiency);
    return { total, accuracy, speed, efficiency, correctCount, totalQuestions: TOTAL_QUESTIONS };
  }, [correctCount, currentIndex, status]);

  return {
    cfg,
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex],
    correctCount,
    timeLeft,
    status,
    feedback,
    totalQuestions: TOTAL_QUESTIONS,
    handleAnswer,
    calculateScore,
  };
}
