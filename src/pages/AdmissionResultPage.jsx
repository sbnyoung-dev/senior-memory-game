import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY } from './AdmissionPage';

const GRADE_INFO = {
  1: { emoji: '🌱', label: '1학년', diff: '초급',  message: '차근차근 함께 시작해봐요!',     color: '#43A047', bg: '#E8F5E9' },
  2: { emoji: '⭐', label: '2학년', diff: '중급',  message: '훌륭한 두뇌 실력이에요!',       color: '#FB8C00', bg: '#FFF3E0' },
  3: { emoji: '🧠', label: '3학년', diff: '고급',  message: '두뇌 능력이 매우 뛰어나세요!', color: '#1F3EE0', bg: '#EEF1FE' },
};

export default function AdmissionResultPage() {
  const navigate = useNavigate();
  const user  = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const grade = user.grade || 1;
  const info  = GRADE_INFO[grade];

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>🎓</div>
        <h1 style={styles.headerTitle}>두뇌대학교</h1>
        <p style={styles.headerSub}>합격 통지서</p>
      </div>

      <div style={styles.content}>
        {/* 축하 문구 */}
        <div style={styles.congratsCard}>
          <div style={styles.stampRow}>
            <div style={styles.stamp}>합격</div>
          </div>
          <p style={styles.congratsName}>{user.name || '지원자'}님,</p>
          <p style={styles.congratsText}>합격을 축하드립니다!</p>
        </div>

        {/* 배정 학년 */}
        <div style={{ ...styles.gradeCard, background: info.bg, border: `2px solid ${info.color}` }}>
          <div style={styles.gradeEmoji}>{info.emoji}</div>
          <div style={styles.gradeLabel} >
            <span style={{ ...styles.gradeNum, color: info.color }}>{info.label}</span>
            <span style={styles.gradeDiff}>난이도 · {info.diff}</span>
          </div>
          <p style={{ ...styles.gradeMessage, color: info.color }}>{info.message}</p>
        </div>

        {/* 안내 */}
        <div style={styles.infoCard}>
          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>📚</span>
            <span style={styles.infoText}>매일 6가지 두뇌 훈련이 준비되어 있어요</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>🏆</span>
            <span style={styles.infoText}>꾸준히 하면 학년이 올라갈 수 있어요</span>
          </div>
        </div>

        <button style={styles.startBtn} onClick={() => navigate('/')}>
          훈련 시작하기
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
  header: {
    width: '100%',
    background: '#1F3EE0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '44px 24px 40px',
    borderRadius: '0 0 32px 32px',
    marginBottom: '24px',
  },
  headerIcon:  { fontSize: '52px', marginBottom: '10px' },
  headerTitle: { fontSize: '28px', fontWeight: '900', color: '#FFFFFF', marginBottom: '6px' },
  headerSub:   {
    fontSize: '20px', color: 'rgba(255,255,255,0.85)', fontWeight: '600',
    background: 'rgba(255,255,255,0.15)', padding: '6px 20px', borderRadius: '20px',
  },
  content: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 20px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  congratsCard: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '32px 24px 28px',
    boxShadow: '0 4px 20px rgba(31,62,224,0.10)',
    textAlign: 'center',
    position: 'relative',
  },
  stampRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' },
  stamp: {
    background: '#E53935',
    color: '#FFFFFF',
    fontSize: '22px',
    fontWeight: '900',
    padding: '8px 18px',
    borderRadius: '8px',
    border: '3px solid #B71C1C',
    transform: 'rotate(-8deg)',
    letterSpacing: '4px',
  },
  congratsName: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#12153D',
    marginBottom: '8px',
  },
  congratsText: {
    fontSize: '30px',
    fontWeight: '900',
    color: '#1F3EE0',
    lineHeight: 1.4,
  },
  gradeCard: {
    borderRadius: '24px',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  gradeEmoji: { fontSize: '64px' },
  gradeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  gradeNum: { fontSize: '36px', fontWeight: '900' },
  gradeDiff: {
    fontSize: '18px', fontWeight: '700', color: '#6876A0',
    background: '#FFFFFF', padding: '4px 14px', borderRadius: '20px',
  },
  gradeMessage: {
    fontSize: '22px',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  infoCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '22px 24px',
    boxShadow: '0 4px 16px rgba(31,62,224,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  infoRow: { display: 'flex', alignItems: 'center', gap: '14px' },
  infoIcon: { fontSize: '28px', flexShrink: 0 },
  infoText: { fontSize: '19px', fontWeight: '600', color: '#12153D', lineHeight: 1.5 },
  startBtn: {
    width: '100%',
    padding: '22px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: '900',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(31,62,224,0.35)',
    cursor: 'pointer',
    marginTop: '4px',
  },
};
