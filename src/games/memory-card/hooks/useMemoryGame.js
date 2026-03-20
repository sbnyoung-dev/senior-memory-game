import { useState, useEffect, useRef, useCallback } from 'react';

const ALL_SYMBOLS = ['⭐', '❤️', '🔵', '🟡', '🟢', '🟠', '💜', '🌙'];

export const DIFFICULTY_CONFIG = {
  easy:   { pairs: 4,  time: 30,  cols: 4, label: '초급', cards: '8장',  timeLabel: '30초' },
  normal: { pairs: 6,  time: 60,  cols: 4, label: '중급', cards: '12장', timeLabel: '1분' },
  hard:   { pairs: 8,  time: 120, cols: 4, label: '고급', cards: '16장', timeLabel: '2분' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCards(difficulty) {
  const { pairs } = DIFFICULTY_CONFIG[difficulty];
  const symbols = ALL_SYMBOLS.slice(0, pairs);
  return shuffle(
    [...symbols, ...symbols].map((symbol, id) => ({
      id,
      symbol,
      isFlipped: false,
      isMatched: false,
    }))
  );
}

export function useMemoryGame(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];

  const [cards, setCards] = useState(() => makeCards(difficulty));
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.time);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'timeout'

  const blockRef = useRef(false);
  const flippedRef = useRef([]); // [cardId] of currently shown (unmatched) flipped cards

  // 타이머
  useEffect(() => {
    if (status !== 'playing') return;
    if (timeLeft <= 0) {
      setStatus('timeout');
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, status]);

  const handleCardClick = useCallback(
    (cardId) => {
      if (blockRef.current || status !== 'playing') return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      const flipped = flippedRef.current;

      if (flipped.length === 0) {
        // 첫 번째 카드 뒤집기
        flippedRef.current = [cardId];
        setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));
        return;
      }

      if (flipped.length === 1) {
        const firstId = flipped[0];
        const firstCard = cards.find((c) => c.id === firstId);

        // 두 번째 카드 뒤집기
        setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));
        flippedRef.current = [];
        blockRef.current = true;
        setAttempts((a) => a + 1);

        if (firstCard.symbol === card.symbol) {
          // 일치 — 잠시 후 matched 처리
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === cardId ? { ...c, isMatched: true } : c
              )
            );
            setMatchedPairs((m) => {
              const next = m + 1;
              if (next === config.pairs) setStatus('won');
              return next;
            });
            blockRef.current = false;
          }, 600);
        } else {
          // 불일치 — 1초 후 두 카드 뒷면으로
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === cardId ? { ...c, isFlipped: false } : c
              )
            );
            blockRef.current = false;
          }, 1000);
        }
      }
    },
    [cards, status, config.pairs]
  );

  const calculateScore = useCallback(() => {
    const accuracyScore = Math.round((matchedPairs / config.pairs) * 60);
    const speedScore = Math.max(8, Math.round((timeLeft / config.time) * 25));
    const wrongAttempts = Math.max(0, attempts - matchedPairs);
    const efficiencyScore = Math.max(5, 15 - wrongAttempts * 2);
    return {
      total: Math.min(100, accuracyScore + speedScore + efficiencyScore),
      accuracy: accuracyScore,
      speed: speedScore,
      efficiency: efficiencyScore,
      matchedPairs,
      totalPairs: config.pairs,
      attempts,
      timeLeft,
      totalTime: config.time,
      status,
      difficulty,
    };
  }, [matchedPairs, attempts, timeLeft, config, status, difficulty]);

  return {
    cards,
    matchedPairs,
    attempts,
    timeLeft,
    status,
    cols: config.cols,
    totalPairs: config.pairs,
    handleCardClick,
    calculateScore,
  };
}
