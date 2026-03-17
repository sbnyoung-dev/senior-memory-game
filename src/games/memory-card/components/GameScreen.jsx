import { useEffect } from 'react';
import { useMemoryGame } from '../hooks/useMemoryGame';
import Card from './Card';

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}분 ${String(s).padStart(2, '0')}초` : `${s}초`;
}

export default function GameScreen({ difficulty, onEnd, onQuit }) {
  const game = useMemoryGame(difficulty);

  useEffect(() => {
    if (game.status === 'won' || game.status === 'timeout') {
      const timer = setTimeout(() => {
        onEnd(game.calculateScore());
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [game.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const isUrgent = game.timeLeft <= 10 && game.status === 'playing';

  const cols = game.cols;
  const cardSize = Math.min(96, Math.floor((Math.min(window.innerWidth, 520) - 48 - (cols - 1) * 12) / cols));

  const overlay = game.status !== 'playing' && (
    <div style={styles.overlay}>
      <div style={styles.overlayBox}>
        <div style={styles.overlayEmoji}>{game.status === 'won' ? '🎉' : '⏰'}</div>
        <div style={styles.overlayText}>
          {game.status === 'won' ? '모두 찾았어요!' : '시간 종료!'}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {overlay}

      {/* 상단 통계 */}
      <div style={styles.statsBar}>
        <div style={{ ...styles.statBox, ...(isUrgent ? styles.statBoxUrgent : {}) }}>
          <span style={styles.statLabel}>남은 시간</span>
          <span style={{ ...styles.statValue, ...(isUrgent ? styles.statValueUrgent : {}) }}>
            {formatTime(game.timeLeft)}
          </span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>시도 횟수</span>
          <span style={styles.statValue}>{game.attempts}회</span>
        </div>
        <div style={{ ...styles.statBox, ...styles.statBoxAccent }}>
          <span style={styles.statLabel}>맞춘 쌍</span>
          <span style={{ ...styles.statValue, ...styles.statValueAccent }}>
            {game.matchedPairs}/{game.totalPairs}
          </span>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${cols}, ${cardSize}px)`,
          gap: '12px',
        }}
      >
        {game.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            size={cardSize}
            onClick={game.handleCardClick}
          />
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
  grid: {
    display: 'grid',
    marginBottom: '32px',
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
