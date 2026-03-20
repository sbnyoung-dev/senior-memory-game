import { useEffect } from 'react';
import { useStroopGame } from '../hooks/useStroopGame';

export default function GameScreen({ difficulty, onEnd, onQuit }) {
  const game = useStroopGame(difficulty);
  const { cfg, currentQuestion, currentIndex, correctCount, timeLeft, status, feedback, totalQuestions, handleAnswer } = game;

  const isUrgent = timeLeft <= 10 && status === 'playing';

  useEffect(() => {
    if (status === 'timeout' || status === 'done') {
      const timer = setTimeout(() => {
        onEnd(game.calculateScore());
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const overlay = status !== 'playing' && (
    <div style={styles.overlay}>
      <div style={styles.overlayBox}>
        <div style={styles.overlayEmoji}>{status === 'done' ? '🎉' : '⏰'}</div>
        <div style={styles.overlayText}>
          {status === 'done' ? '모두 맞혔어요!' : '시간 종료!'}
        </div>
      </div>
    </div>
  );

  // 선택지 버튼 스타일 결정
  function getChoiceStyle(color) {
    if (!feedback) return styles.choiceBtn;
    if (color === feedback.correct) return { ...styles.choiceBtn, ...styles.choiceBtnCorrect };
    if (color === feedback.selected && !feedback.isCorrect) return { ...styles.choiceBtn, ...styles.choiceBtnWrong };
    return { ...styles.choiceBtn, ...styles.choiceBtnDim };
  }

  function getChoiceTextStyle(color) {
    if (!feedback) return styles.choiceBtnText;
    if (color === feedback.correct) return { ...styles.choiceBtnText, color: '#FFFFFF' };
    if (color === feedback.selected && !feedback.isCorrect) return { ...styles.choiceBtnText, color: '#FFFFFF' };
    return { ...styles.choiceBtnText, color: '#A0A8C0' };
  }

  // 선택지 레이아웃: 6개면 2열 3행, 나머지는 2열
  const choices = cfg.colors;
  const cols = choices.length <= 4 ? 2 : 2;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes feedbackPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {overlay}

      {/* 상단 통계 */}
      <div style={styles.statsBar}>
        <div style={{ ...styles.statBox, ...(isUrgent ? styles.statBoxUrgent : {}) }}>
          <span style={styles.statLabel}>남은 시간</span>
          <span style={{ ...styles.statValue, ...(isUrgent ? styles.statValueUrgent : {}) }}>
            {timeLeft}초
          </span>
        </div>
        <div style={{ ...styles.statBox, ...styles.statBoxAccent }}>
          <span style={styles.statLabel}>맞춘 수</span>
          <span style={{ ...styles.statValue, ...styles.statValueAccent }}>
            {correctCount}개
          </span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>문제</span>
          <span style={styles.statValue}>
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* 색깔 단어 표시 */}
      <div style={styles.wordCard}>
        {feedback && feedback.isCorrect && (
          <div style={styles.correctBadge}>
            <span style={styles.correctBadgeText}>정답!</span>
          </div>
        )}
        <span
          style={{
            ...styles.wordText,
            color: cfg.colorValues[currentQuestion.inkColor],
          }}
        >
          {currentQuestion.word}
        </span>
        <p style={styles.wordHint}>이 글자의 색깔은?</p>
      </div>

      {/* 선택지 버튼 */}
      <div style={{ ...styles.choiceGrid, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {choices.map((color) => (
          <button
            key={color}
            style={getChoiceStyle(color)}
            onClick={() => handleAnswer(color)}
            disabled={!!feedback || status !== 'playing'}
          >
            <span style={getChoiceTextStyle(color)}>
              {color}
            </span>
            <span
              style={{
                ...styles.choiceDot,
                background: cfg.colorValues[color],
              }}
            />
          </button>
        ))}
      </div>

      <button style={styles.quitBtn} onClick={onQuit}>
        그만하기
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#F4F6FF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 24px 48px',
    position: 'relative',
  },
  correctBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '64px',
    height: '64px',
    minWidth: '50px',
    minHeight: '50px',
    borderRadius: '50%',
    background: '#43A047',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    animation: 'feedbackPop 0.35s ease-out forwards',
    zIndex: 10,
  },
  correctBadgeText: {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: '800',
  },
  statsBar: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '520px',
    marginBottom: '28px',
  },
  statBox: {
    flex: 1,
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '16px 8px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(31,62,224,0.08)',
    border: '2px solid transparent',
  },
  statBoxUrgent: {
    border: '2px solid #FF4D4D',
    background: '#FFF0F0',
  },
  statBoxAccent: {
    border: '2px solid #FF8C00',
    background: '#FFF8EE',
  },
  statLabel: {
    display: 'block',
    fontSize: '16px',
    color: '#6876A0',
    marginBottom: '6px',
    fontWeight: '600',
  },
  statValue: {
    display: 'block',
    fontSize: '22px',
    fontWeight: '800',
    color: '#12153D',
  },
  statValueUrgent: {
    color: '#FF4D4D',
  },
  statValueAccent: {
    color: '#FF8C00',
  },
  wordCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(31,62,224,0.12)',
    padding: '48px 24px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
  },
  wordText: {
    fontSize: '72px',
    fontWeight: '900',
    lineHeight: 1.1,
    marginBottom: '16px',
    letterSpacing: '-1px',
  },
  wordHint: {
    fontSize: '20px',
    color: '#6876A0',
    fontWeight: '600',
  },
  choiceGrid: {
    display: 'grid',
    gap: '12px',
    width: '100%',
    maxWidth: '520px',
    marginBottom: '28px',
  },
  choiceBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '20px 16px',
    background: '#FFFFFF',
    border: '2px solid #E0E5F0',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(31,62,224,0.08)',
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s',
  },
  choiceBtnCorrect: {
    background: '#43A047',
    border: '2px solid #43A047',
  },
  choiceBtnWrong: {
    background: '#E53935',
    border: '2px solid #E53935',
  },
  choiceBtnDim: {
    background: '#F4F6FF',
    border: '2px solid #E0E5F0',
  },
  choiceBtnText: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#12153D',
  },
  choiceDot: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  quitBtn: {
    padding: '18px 52px',
    background: '#FFFFFF',
    color: '#6876A0',
    fontSize: '20px',
    fontWeight: '700',
    borderRadius: '14px',
    border: '2px solid #E0E5F0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(18,21,61,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  overlayBox: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '44px 64px',
    textAlign: 'center',
    boxShadow: '0 8px 40px rgba(31,62,224,0.2)',
  },
  overlayEmoji: {
    fontSize: '68px',
    marginBottom: '14px',
  },
  overlayText: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#12153D',
  },
};
