import { useNavigate } from 'react-router-dom';

function getGrade(total) {
  if (total >= 90) return { emoji: '🧠', grade: '계산능력 박사', message: '계산 실력이 탁월해요!' };
  if (total >= 75) return { emoji: '⭐', grade: '계산능력 우수', message: '계산을 매우 잘 하세요!' };
  if (total >= 60) return { emoji: '👍', grade: '계산능력 양호', message: '꾸준히 하면 더 좋아져요!' };
  if (total >= 45) return { emoji: '💪', grade: '계산능력 훈련중', message: '매일 조금씩 연습해봐요!' };
  return { emoji: '🌱', grade: '계산능력 새싹', message: '잘 하셨어요!' };
}

function ScoreBar({ label, score, max, color }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div style={styles.barRow}>
      <div style={styles.barLabelRow}>
        <span style={styles.barLabel}>{label}</span>
        <span style={{ ...styles.barScore, color }}>{score}/{max}점</span>
      </div>
      <div style={styles.barBg}>
        <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ResultScreen({ result, onRestart, onHome }) {
  const navigate = useNavigate();
  const { total, accuracy, speed, correctCount, totalAnswered } = result;
  const { emoji, grade, message } = getGrade(total);

  return (
    <div style={styles.container}>
      {/* 점수 헤더 */}
      <div style={styles.scoreHeader}>
        <p style={styles.scoreLabel}>오늘의 계산능력 점수</p>
        <div style={styles.scoreRow}>
          <span style={styles.scoreNumber}>{total}</span>
          <span style={styles.scoreMax}>/ 100점</span>
        </div>
        <div style={styles.gradeBadge}>
          <span style={styles.gradeEmoji}>{emoji}</span>
          <div>
            <div style={styles.gradeName}>{grade}</div>
            <div style={styles.gradeMessage}>{message}</div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* 정답 요약 */}
        <div style={styles.summaryRow}>
          <div style={styles.summaryBox}>
            <span style={styles.summaryValue}>{correctCount}</span>
            <span style={styles.summaryLabel}>정답</span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryBox}>
            <span style={styles.summaryValue}>{totalAnswered - correctCount}</span>
            <span style={styles.summaryLabel}>오답</span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryBox}>
            <span style={styles.summaryValue}>{totalAnswered}</span>
            <span style={styles.summaryLabel}>전체 문제</span>
          </div>
        </div>

        {/* 세부 점수 */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>세부 점수</h2>
          <ScoreBar label="정확도" score={accuracy} max={60} color="#1F3EE0" />
          <ScoreBar label="빠르기" score={speed}    max={25} color="#FF8C00" />
          <div style={styles.baseScoreRow}>
            <span style={styles.baseScoreLabel}>기본 점수</span>
            <span style={styles.baseScoreValue}>15 / 15점</span>
          </div>
        </div>

        {/* 응원 메시지 */}
        <div style={styles.encouragement}>
          <span style={styles.encourageIcon}>💡</span>
          <span style={styles.encourageText}>
            생활 속 계산 능력이 뇌를 건강하게 해요
          </span>
        </div>

        {/* 버튼 */}
        <button style={styles.restartBtn} onClick={onRestart}>
          다시 하기
        </button>
        <button style={styles.homeBtn} onClick={onHome}>
          홈으로
        </button>
      </div>
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
  },
  scoreHeader: {
    width: '100%',
    background: '#1F3EE0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '44px 24px 40px',
    borderRadius: '0 0 32px 32px',
    marginBottom: '24px',
  },
  scoreLabel: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '8px',
    fontWeight: '600',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    marginBottom: '24px',
  },
  scoreNumber: {
    fontSize: '88px',
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 1,
  },
  scoreMax: {
    fontSize: '22px',
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    paddingBottom: '12px',
  },
  gradeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: 'rgba(255,255,255,0.18)',
    borderRadius: '16px',
    padding: '14px 24px',
  },
  gradeEmoji: { fontSize: '40px' },
  gradeName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '2px',
  },
  gradeMessage: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.85)',
  },
  content: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 20px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  summaryRow: {
    display: 'flex',
    background: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 4px 16px rgba(31,62,224,0.08)',
    overflow: 'hidden',
  },
  summaryBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 8px',
    gap: '4px',
  },
  summaryValue: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#12153D',
  },
  summaryLabel: {
    fontSize: '18px',
    color: '#6876A0',
    fontWeight: '600',
  },
  summaryDivider: {
    width: '2px',
    background: '#F0F2F8',
    margin: '16px 0',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(31,62,224,0.08)',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#12153D',
    marginBottom: '20px',
  },
  barRow: { marginBottom: '18px' },
  barLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  barLabel: { fontSize: '20px', color: '#12153D', fontWeight: '700' },
  barScore: { fontSize: '20px', fontWeight: '700' },
  barBg: {
    background: '#F0F2F8',
    borderRadius: '8px',
    height: '18px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '8px',
    transition: 'width 0.8s ease',
  },
  baseScoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '4px',
  },
  baseScoreLabel: { fontSize: '20px', color: '#12153D', fontWeight: '700' },
  baseScoreValue: { fontSize: '20px', fontWeight: '700', color: '#00A86B' },
  encouragement: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#FFF8EE',
    border: '2px solid #FFD599',
    borderRadius: '14px',
    padding: '18px 20px',
  },
  encourageIcon: { fontSize: '26px', flexShrink: 0 },
  encourageText: { fontSize: '18px', color: '#7A4800', fontWeight: '600' },
  restartBtn: {
    width: '100%',
    padding: '20px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '22px',
    fontWeight: '800',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(31,62,224,0.35)',
    cursor: 'pointer',
    border: 'none',
  },
  homeBtn: {
    width: '100%',
    padding: '20px',
    background: '#FFFFFF',
    color: '#6876A0',
    fontSize: '22px',
    fontWeight: '700',
    borderRadius: '16px',
    border: '2px solid #E0E5F0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer',
  },
};
