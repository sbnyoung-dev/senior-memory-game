import { useEffect } from 'react';
import { useTrafficGame } from '../hooks/useTrafficGame';

export default function GameScreen({ difficulty, onEnd, onQuit }) {
  const {
    currentSignal,
    isReversed,
    phase,
    timeLeft,
    feedback,
    correctCount,
    totalAnswered,
    badgeKey,
    handleAnswer,
    calculateScore,
  } = useTrafficGame(difficulty);

  const isUrgent = timeLeft <= 10 && (phase === 'playing' || phase === 'feedback');

  useEffect(() => {
    if (phase === 'timeout') {
      const t = setTimeout(() => onEnd(calculateScore()), 1200);
      return () => clearTimeout(t);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function getActionBtnStyle(label) {
    const isStop = label === '멈춤';
    const base = isStop ? styles.stopBtn : styles.goBtn;
    if (!feedback || feedback.timedOut || feedback.isCorrect) return base;
    if (feedback.answer === label) return { ...base, ...styles.btnWrong };
    return base;
  }

  const isInteractive = phase === 'playing';

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes feedbackPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes switchIn {
          0%   { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* 규칙 전환 오버레이 */}
      {phase === 'rule-switch' && (
        <div style={styles.ruleSwitchOverlay}>
          <div style={styles.ruleSwitchBox}>
            <div style={styles.ruleSwitchEmoji}>⚠️</div>
            <div style={styles.ruleSwitchTitle}>규칙이 바뀌었어요!</div>
            <div style={styles.ruleSwitchNewRule}>
              {isReversed ? (
                <>
                  <div style={styles.ruleItem}>🔴 빨간불 → 출발</div>
                  <div style={styles.ruleItem}>🟢 초록불 → 멈춤</div>
                </>
              ) : (
                <>
                  <div style={styles.ruleItem}>🟢 초록불 → 출발</div>
                  <div style={styles.ruleItem}>🔴 빨간불 → 멈춤</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 종료 오버레이 */}
      {phase === 'timeout' && (
        <div style={styles.overlay}>
          <div style={styles.overlayBox}>
            <div style={styles.overlayEmoji}>⏰</div>
            <div style={styles.overlayText}>시간 종료!</div>
          </div>
        </div>
      )}

      {/* 상단 통계 */}
      <div style={styles.statsBar}>
        <div style={{ ...styles.statBox, border: '2px solid #1F3EE0', background: '#EEF1FE' }}>
          <span style={styles.statLabel}>맞춘 수</span>
          <span style={{ ...styles.statValue, color: '#1F3EE0' }}>{correctCount}개</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>푼 문제</span>
          <span style={styles.statValue}>{totalAnswered}개</span>
        </div>
        <div style={{ ...styles.statBox, ...(isUrgent ? styles.statBoxUrgent : {}) }}>
          <span style={styles.statLabel}>남은 시간</span>
          <span style={{ ...styles.statValue, ...(isUrgent ? { color: '#FF4D4D' } : {}) }}>
            {timeLeft}초
          </span>
        </div>
      </div>

      {/* 규칙 표시 박스 */}
      <div style={{
        ...styles.ruleBox,
        ...(isReversed ? styles.ruleBoxReversed : styles.ruleBoxNormal),
      }}>
        {isReversed ? (
          <span style={styles.ruleText}>
            🔴 반전 규칙 적용 중! &nbsp;|&nbsp; 🟢 초록불 → 멈춤 &nbsp;|&nbsp; 🔴 빨간불 → 출발
          </span>
        ) : (
          <span style={styles.ruleText}>
            🟢 초록불 → 출발 &nbsp;|&nbsp; 🔴 빨간불 → 멈춤
          </span>
        )}
      </div>

      {/* 신호등 카드 */}
      <div style={{
        ...styles.trafficCard,
        ...(isReversed ? styles.trafficCardReversed : {}),
      }}>
        {feedback && feedback.isCorrect && (
          <div key={badgeKey} style={styles.correctBadge}>
            <span style={styles.correctBadgeText}>정답!</span>
          </div>
        )}

        {/* 신호등 */}
        <div style={styles.trafficLightBody}>
          <div style={styles.trafficLightPole} />
          <div style={styles.trafficLightBox}>
            {/* 빨강 */}
            <div style={{
              ...styles.light,
              background: '#E53935',
              opacity: currentSignal === 'red' ? 1 : 0.15,
              boxShadow: currentSignal === 'red'
                ? '0 0 28px 10px rgba(229,57,53,0.55)'
                : 'none',
            }} />
            {/* 노랑 (장식) */}
            <div style={{
              ...styles.light,
              background: '#FFB300',
              opacity: 0.15,
            }} />
            {/* 초록 */}
            <div style={{
              ...styles.light,
              background: '#43A047',
              opacity: currentSignal === 'green' ? 1 : 0.15,
              boxShadow: currentSignal === 'green'
                ? '0 0 28px 10px rgba(67,160,71,0.55)'
                : 'none',
            }} />
          </div>
        </div>

        <p style={styles.signalHint}>어떤 버튼을 눌러야 할까요?</p>
      </div>

      {/* 버튼 */}
      <div style={styles.actionRow}>
        <button
          style={getActionBtnStyle('멈춤')}
          onClick={() => isInteractive && handleAnswer('멈춤')}
          disabled={!isInteractive}
        >
          🛑 멈춤
        </button>
        <button
          style={getActionBtnStyle('출발')}
          onClick={() => isInteractive && handleAnswer('출발')}
          disabled={!isInteractive}
        >
          🚗 출발
        </button>
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
    padding: '28px 20px 48px',
    position: 'relative',
  },
  statsBar: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '520px',
    marginBottom: '20px',
  },
  statBox: {
    flex: 1,
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '14px 8px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(31,62,224,0.08)',
    border: '2px solid transparent',
  },
  statBoxUrgent: {
    border: '2px solid #FF4D4D',
    background: '#FFF0F0',
  },
  statLabel: {
    display: 'block',
    fontSize: '15px',
    color: '#6876A0',
    marginBottom: '4px',
    fontWeight: '600',
  },
  statValue: {
    display: 'block',
    fontSize: '22px',
    fontWeight: '800',
    color: '#12153D',
  },
  ruleBox: {
    width: '100%',
    maxWidth: '520px',
    borderRadius: '14px',
    padding: '14px 18px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  ruleBoxNormal: {
    background: '#1F3EE0',
  },
  ruleBoxReversed: {
    background: '#C62828',
  },
  ruleText: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 1.5,
  },
  trafficCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(31,62,224,0.12)',
    padding: '36px 24px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
    border: '3px solid transparent',
  },
  trafficCardReversed: {
    border: '3px solid #E53935',
  },
  correctBadge: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    width: '64px',
    height: '64px',
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
    fontSize: '18px',
    fontWeight: '800',
  },
  trafficLightBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  trafficLightPole: {
    width: '12px',
    height: '0px',
    background: '#555',
    borderRadius: '6px',
  },
  trafficLightBox: {
    background: '#1A1A1A',
    borderRadius: '24px',
    padding: '20px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  },
  light: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    transition: 'opacity 0.2s, box-shadow 0.2s',
  },
  signalHint: {
    fontSize: '20px',
    color: '#6876A0',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionRow: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    maxWidth: '520px',
    marginBottom: '20px',
  },
  stopBtn: {
    flex: 1,
    padding: '22px 8px',
    background: '#E53935',
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: '800',
    borderRadius: '18px',
    boxShadow: '0 6px 20px rgba(229,57,53,0.35)',
    cursor: 'pointer',
    border: 'none',
  },
  goBtn: {
    flex: 1,
    padding: '22px 8px',
    background: '#43A047',
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: '800',
    borderRadius: '18px',
    boxShadow: '0 6px 20px rgba(67,160,71,0.35)',
    cursor: 'pointer',
    border: 'none',
  },
  btnWrong: {
    background: '#B71C1C',
    boxShadow: 'none',
    opacity: 0.7,
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
    cursor: 'pointer',
  },
  ruleSwitchOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(180, 0, 0, 0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  ruleSwitchBox: {
    background: '#FFFFFF',
    borderRadius: '28px',
    padding: '44px 48px',
    textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    animation: 'switchIn 0.3s ease-out forwards',
    maxWidth: '340px',
    width: '90%',
  },
  ruleSwitchEmoji: {
    fontSize: '64px',
    marginBottom: '12px',
  },
  ruleSwitchTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#B71C1C',
    marginBottom: '20px',
  },
  ruleSwitchNewRule: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  ruleItem: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#12153D',
    background: '#F4F6FF',
    borderRadius: '12px',
    padding: '12px 16px',
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
