import { useState, useEffect, useRef } from 'react';

export const DIFFICULTY_CONFIG = {
  easy: {
    label: '초급',
    totalTime: 60,
    switchTimes: [30],         // 규칙 전환 1회: 30초 남았을 때
    signalMs: 3000,
    timeLabel: '60초',
  },
  normal: {
    label: '중급',
    totalTime: 60,
    switchTimes: [40, 20],           // 규칙 전환 2회: 40초, 20초 남았을 때
    signalMs: 3000,
    timeLabel: '60초',
  },
  hard: {
    label: '고급',
    totalTime: 90,
    switchTimes: [72, 54, 36, 18],   // 규칙 전환 4회: 18초 간격
    signalMs: 3000,
    timeLabel: '90초',
  },
};

const SIGNAL_BUFFER = 300;

function randomSignals(count) {
  return Array.from({ length: count }, () => (Math.random() < 0.5 ? 'red' : 'green'));
}

export function useTrafficGame(difficulty) {
  const cfg = DIFFICULTY_CONFIG[difficulty];

  const [signals] = useState(() => randomSignals(SIGNAL_BUFFER));
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isReversed, setIsReversed] = useState(false);
  const [phase, setPhase] = useState('playing'); // 'playing' | 'feedback' | 'rule-switch' | 'timeout'
  const [timeLeft, setTimeLeft] = useState(cfg.totalTime);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [badgeKey, setBadgeKey] = useState(0);

  const phaseRef = useRef('playing');
  const isReversedRef = useRef(false);
  const correctCountRef = useRef(0);
  const totalAnsweredRef = useRef(0);
  const displayIndexRef = useRef(0);
  const responseTimesRef = useRef([]);
  const questionStartRef = useRef(Date.now());
  const timerActiveRef = useRef(true);
  const timeLeftRef = useRef(cfg.totalTime);
  const answeredRef = useRef(false);
  const triggeredSwitchesRef = useRef(new Set());

  // Main countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timerActiveRef.current) return;
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        timeLeftRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pause timer during rule-switch, stop on timeout
  useEffect(() => {
    timerActiveRef.current = phase === 'playing' || phase === 'feedback';
  }, [phase]);

  // Detect timeout
  useEffect(() => {
    if (timeLeft === 0 && phaseRef.current !== 'timeout') {
      phaseRef.current = 'timeout';
      setPhase('timeout');
    }
  }, [timeLeft]);

  function getCorrectAnswer(signal, reversed) {
    if (!reversed) return signal === 'green' ? '출발' : '멈춤';
    return signal === 'green' ? '멈춤' : '출발';
  }

  // 남은 시간 기준으로 규칙 전환이 필요한지 확인
  function checkSwitchNeeded() {
    const tl = timeLeftRef.current;
    const hit = cfg.switchTimes.find(
      (t) => tl <= t && !triggeredSwitchesRef.current.has(t)
    );
    if (hit !== undefined) {
      triggeredSwitchesRef.current.add(hit);
      return true;
    }
    return false;
  }

  function advance() {
    if (phaseRef.current === 'timeout') return;

    // 다음 신호 (버퍼 순환)
    const nextIdx = (displayIndexRef.current + 1) % SIGNAL_BUFFER;
    displayIndexRef.current = nextIdx;
    setDisplayIndex(nextIdx);

    // 규칙 전환 체크
    if (checkSwitchNeeded()) {
      const newReversed = !isReversedRef.current;
      isReversedRef.current = newReversed;
      setIsReversed(newReversed);
      phaseRef.current = 'rule-switch';
      setFeedback(null);
      setPhase('rule-switch');

      setTimeout(() => {
        if (phaseRef.current === 'rule-switch') {
          phaseRef.current = 'playing';
          setPhase('playing');
        }
      }, 2000);
    } else {
      phaseRef.current = 'playing';
      setFeedback(null);
      setPhase('playing');
    }
  }

  function processAnswer(answer) {
    if (phaseRef.current !== 'playing') return;

    const signal = signals[displayIndexRef.current];
    const reversed = isReversedRef.current;
    const correct = getCorrectAnswer(signal, reversed);
    const isCorrect = answer !== null && answer === correct;
    const responseTime = Math.min(Date.now() - questionStartRef.current, cfg.signalMs);

    totalAnsweredRef.current += 1;
    setTotalAnswered(totalAnsweredRef.current);

    if (isCorrect) {
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
      setBadgeKey((k) => k + 1);
    }
    responseTimesRef.current.push(responseTime);

    phaseRef.current = 'feedback';
    setPhase('feedback');
    setFeedback({ isCorrect, signal, answer, correctAnswer: correct, timedOut: answer === null });

    setTimeout(advance, isCorrect ? 700 : 1000);
  }

  // 신호 타임아웃: displayIndex 또는 phase가 바뀔 때 리셋
  useEffect(() => {
    if (phase !== 'playing') return;
    questionStartRef.current = Date.now();
    answeredRef.current = false;

    const t = setTimeout(() => {
      if (phaseRef.current === 'playing' && !answeredRef.current) {
        processAnswer(null);
      }
    }, cfg.signalMs);
    return () => clearTimeout(t);
  }, [displayIndex, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(answer) {
    answeredRef.current = true;
    processAnswer(answer);
  }

  function calculateScore() {
    const correct = correctCountRef.current;
    const total = Math.max(1, totalAnsweredRef.current);
    const times = responseTimesRef.current;

    const accuracy = Math.round((correct / total) * 60);

    let speed = 8;
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const fast = cfg.signalMs * 0.25;
      const ratio = Math.max(0, Math.min(1, (avg - fast) / (cfg.signalMs - fast)));
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
    cfg,
    currentSignal: signals[displayIndex],
    displayIndex,
    isReversed,
    phase,
    timeLeft,
    feedback,
    correctCount,
    totalAnswered,
    badgeKey,
    handleAnswer,
    calculateScore,
  };
}
