import { useState, useCallback } from 'react';

export const DIFFICULTY_CONFIG = {
  easy:   { label: '초급', size: 2, rounds: 6, timeLimit: 90, detail: '2×2 · 4조각 · 6판 · 90초' },
  normal: { label: '중급', size: 3, rounds: 3, timeLimit: 90, detail: '3×3 · 9조각 · 3판 · 90초' },
  hard:   { label: '고급', size: 4, rounds: 2, timeLimit: 90, detail: '4×4 · 16조각 · 2판 · 90초' },
};

export const EMOJI_SETS = {
  easy:   ['🌸', '🌺', '🌼', '🌻'],
  normal: ['🌸', '🌺', '🌼', '🌻', '🍀', '🌿', '🌱', '🌾', '🌵'],
  hard:   ['🌸', '🌺', '🌼', '🌻', '🍀', '🌿', '🌱', '🌾', '🌵', '🍁', '🍂', '🍃', '🌹', '🌷', '💐', '🌴'],
};

// 효율성 기준 이동 횟수 (par)
const PAR_MOVES = { easy: 6, normal: 18, hard: 36 };

function createShuffledBoard(size) {
  const n = size * size;
  const board = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
  }
  if (board.every((v, i) => v === i)) return createShuffledBoard(size);
  return board;
}

export function usePuzzleGame(difficulty) {
  const cfg    = DIFFICULTY_CONFIG[difficulty];
  const emojis = EMOJI_SETS[difficulty];
  const { size } = cfg;
  const totalPieces = size * size;

  const [board,  setBoard]  = useState(() => createShuffledBoard(size));
  const [moves,  setMoves]  = useState(0);
  const [solved, setSolved] = useState(false);

  const correctCount = board.filter((p, i) => p === i).length;

  const handleSwap = useCallback((fromIdx, toIdx) => {
    if (solved || fromIdx === toIdx) return;
    const next = [...board];
    [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
    setBoard(next);
    setMoves(m => m + 1);
    if (next.every((p, i) => p === i)) setSolved(true);
  }, [board, solved]);

  // timeLeft: 풀었을 때의 남은 시간
  const calculateScore = useCallback((timeLeft) => {
    const parM       = PAR_MOVES[difficulty];
    const accuracy   = Math.round(60 * correctCount / totalPieces);
    const speed      = Math.max(8, Math.round(25 * timeLeft / cfg.timeLimit));
    const efficiency = Math.max(5, Math.round(15 * parM / Math.max(moves, parM)));
    const total      = Math.min(100, accuracy + speed + efficiency);
    return { total, accuracy, speed, efficiency, correctCount, totalPieces, moves };
  }, [correctCount, totalPieces, moves, difficulty, cfg.timeLimit]);

  return {
    cfg, emojis, size,
    board, correctCount, totalPieces,
    moves, solved,
    handleSwap, calculateScore,
  };
}
