import { useState, useEffect, useRef } from 'react';

import gimbapImg     from '../../../assets/image/food/gimbap.png.jpg';
import tteokbokkiImg from '../../../assets/image/food/tteokbokki.png.jpg';
import ramyeonImg    from '../../../assets/image/food/ramyeon.png.jpg';
import sundaeImg     from '../../../assets/image/food/sundae.png.jpg';
import gyeranmariImg from '../../../assets/image/food/gyeranmari.png.jpg';
import eomukImg      from '../../../assets/image/food/eomuk.png.jpg';
import drinkImg      from '../../../assets/image/food/drink.png.jpg';

export const MENU_ITEMS = [
  { id: 'gimbap',     name: '김밥',    price: 3000, image: gimbapImg },
  { id: 'tteokbokki', name: '떡볶이',  price: 4000, image: tteokbokkiImg },
  { id: 'ramyeon',    name: '라면',    price: 4500, image: ramyeonImg },
  { id: 'sundae',     name: '순대',    price: 3500, image: sundaeImg },
  { id: 'gyeranmari', name: '계란말이', price: 2500, image: gyeranmariImg },
  { id: 'eomuk',      name: '어묵',    price: 1000, image: eomukImg },
  { id: 'drink',      name: '음료',    price: 1500, image: drinkImg },
];

export const DIFFICULTY_CONFIG = {
  easy: {
    label: '초급',
    totalTime: 60,
    menuCountMin: 2,
    menuCountMax: 2,
    questionType: 'total',
    timeLabel: '60초',
  },
  normal: {
    label: '중급',
    totalTime: 60,
    menuCountMin: 3,
    menuCountMax: 3,
    questionType: 'random',
    timeLabel: '60초',
  },
  hard: {
    label: '고급',
    totalTime: 90,
    menuCountMin: 4,
    menuCountMax: 4,
    questionType: 'random',
    timeLabel: '90초',
  },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPaidAmount(total) {
  const options = [5000, 10000, 15000, 20000, 30000, 50000];
  return options.find(a => a > total) || 50000;
}

function generateChoices(correct) {
  // Set으로 시작 → correct는 반드시 포함, 중복 불가
  const chosen = new Set([correct]);
  const offsets = shuffle([500, 1000, 1500, 2000, 2500, 3000]);
  for (const offset of offsets) {
    if (chosen.size >= 4) break;
    const cands = [correct + offset, correct - offset]
      .filter(w => w > 0 && !chosen.has(w));
    if (cands.length > 0) {
      chosen.add(cands[Math.floor(Math.random() * cands.length)]);
    }
  }
  // 보완: 부족하면 단순 증가값으로 채움
  let extra = 500;
  while (chosen.size < 4) {
    if (!chosen.has(correct + extra)) chosen.add(correct + extra);
    extra += 500;
  }
  return shuffle([...chosen]);
}

function makeQuestion(difficulty) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const count = cfg.menuCountMin
    + Math.floor(Math.random() * (cfg.menuCountMax - cfg.menuCountMin + 1));
  const selected = shuffle(MENU_ITEMS).slice(0, count);
  const total = selected.reduce((s, m) => s + m.price, 0);

  const qType = cfg.questionType === 'total'
    ? 'total'
    : (Math.random() < 0.5 ? 'total' : 'change');

  let paidAmount = null;
  let correct;
  if (qType === 'total') {
    correct = total;
  } else {
    paidAmount = getPaidAmount(total);
    correct = paidAmount - total;
  }

  return { selected, total, qType, paidAmount, correct, choices: generateChoices(correct) };
}

export function useBunsikGame(difficulty) {
  const cfg = DIFFICULTY_CONFIG[difficulty];

  const [question, setQuestion]         = useState(() => makeQuestion(difficulty));
  const [questionKey, setQuestionKey]   = useState(0);
  const [phase, setPhase]               = useState('animating');
  const [animStep, setAnimStep]         = useState(-1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [timeLeft, setTimeLeft]         = useState(cfg.totalTime);
  const [feedback, setFeedback]         = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [badgeKey, setBadgeKey]         = useState(0);

  const phaseRef         = useRef('animating');
  const correctCountRef  = useRef(0);
  const totalAnsweredRef = useRef(0);
  const responseTimesRef = useRef([]);
  const questionStartRef = useRef(0);
  const timerActiveRef   = useRef(false);

  // 메인 타이머 (question / feedback 중에만 동작)
  useEffect(() => {
    const id = setInterval(() => {
      if (!timerActiveRef.current) return;
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    timerActiveRef.current = phase === 'question' || phase === 'feedback';
  }, [phase]);

  useEffect(() => {
    if (timeLeft === 0 && phaseRef.current !== 'timeout') {
      phaseRef.current = 'timeout';
      setPhase('timeout');
    }
  }, [timeLeft]);

  // 터치 애니메이션
  useEffect(() => {
    if (phase !== 'animating') return;

    const total = question.selected.length;
    let step = 0;
    const ids = [];

    const doStep = () => {
      if (phaseRef.current !== 'animating') return;
      setAnimStep(step);
      setRevealedCount(step + 1);
      step++;
      if (step < total) {
        ids.push(setTimeout(doStep, 1000));
      } else {
        ids.push(setTimeout(() => {
          if (phaseRef.current !== 'animating') return;
          setAnimStep(-1);
          phaseRef.current = 'question';
          setPhase('question');
          questionStartRef.current = Date.now();
        }, 450));
      }
    };

    ids.push(setTimeout(doStep, 350));
    return () => ids.forEach(clearTimeout);
  }, [phase, questionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(choice) {
    if (phaseRef.current !== 'question') return;

    const isCorrect = choice === question.correct;
    const rt = Date.now() - questionStartRef.current;

    totalAnsweredRef.current += 1;
    setTotalAnswered(totalAnsweredRef.current);

    if (isCorrect) {
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
      setBadgeKey(k => k + 1);
    }
    responseTimesRef.current.push(rt);

    phaseRef.current = 'feedback';
    setPhase('feedback');
    setFeedback({ isCorrect, selectedAnswer: choice });

    setTimeout(() => {
      if (phaseRef.current === 'timeout') return;
      const next = makeQuestion(difficulty);
      setQuestion(next);
      setRevealedCount(0);
      setAnimStep(-1);
      setFeedback(null);
      phaseRef.current = 'animating';
      setPhase('animating');
      setQuestionKey(k => k + 1);
    }, isCorrect ? 900 : 1300);
  }

  function calculateScore() {
    const correct = correctCountRef.current;
    const total   = Math.max(1, totalAnsweredRef.current);
    const times   = responseTimesRef.current;

    const accuracy = Math.round((correct / total) * 60);

    let speed = 8;
    if (times.length > 0) {
      const avg    = times.reduce((a, b) => a + b, 0) / times.length;
      const maxMs  = difficulty === 'easy' ? 8000 : difficulty === 'normal' ? 12000 : 15000;
      const ratio  = Math.max(0, Math.min(1, (avg - 1500) / (maxMs - 1500)));
      speed = Math.max(8, Math.round(25 - ratio * 17));
    }

    return {
      total: Math.min(100, accuracy + speed + 15),
      accuracy,
      speed,
      base: 15,
      correctCount: correct,
      totalAnswered: totalAnsweredRef.current,
    };
  }

  return {
    question,
    questionKey,
    phase,
    animStep,
    revealedCount,
    timeLeft,
    feedback,
    correctCount,
    totalAnswered,
    badgeKey,
    handleAnswer,
    calculateScore,
  };
}
