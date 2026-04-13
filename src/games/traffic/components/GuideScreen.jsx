import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIG } from '../hooks/useTrafficGame';

const DIFF_DETAILS = {
  easy:   '제한시간 60초 · 규칙 전환 1회',
  normal: '제한시간 60초 · 규칙 전환 2회',
  hard:   '제한시간 90초 · 규칙 전환 4회',
};

export default function GuideScreen({ onStart, lockedDifficulty }) {
  const [selected, setSelected] = useState(lockedDifficulty || 'easy');
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← 홈으로
        </button>
        <div style={styles.headerIcon}>🚦</div>
        <h1 style={styles.title}>신호등 게임</h1>
        <p style={styles.subtitle}>전두엽 집행능력을 키우는 두뇌 훈련</p>
      </div>

      <div style={styles.content}>
        {/* 게임 방법 */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>게임 방법</h2>
          <div style={styles.steps}>
            <div style={styles.step}>
              <span style={styles.stepNumber}>1</span>
              <span style={styles.stepText}>신호등 색깔을 보고 버튼을 눌러요!</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNumber}>2</span>
              <span style={styles.stepText}>🟢 초록불 → 출발 버튼을 눌러요</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNumber}>3</span>
              <span style={styles.stepText}>🔴 빨간불 → 멈춤 버튼을 눌러요</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNumber}>4</span>
              <span style={styles.stepText}>중간에 규칙이 바뀔 수 있어요!</span>
            </div>
          </div>

          {/* 예시 박스 */}
          <div style={styles.exampleWrap}>
            <p style={styles.exampleLabel}>예시</p>
            <div style={styles.exampleRow}>
              <div style={styles.exampleItem}>
                <span style={styles.exampleSignal}>🟢</span>
                <span style={styles.exampleArrow}>→</span>
                <div style={{ ...styles.exampleBtn, background: '#1F3EE0' }}>🚗 출발</div>
              </div>
              <div style={styles.exampleItem}>
                <span style={styles.exampleSignal}>🔴</span>
                <span style={styles.exampleArrow}>→</span>
                <div style={{ ...styles.exampleBtn, background: '#E53935' }}>🛑 멈춤</div>
              </div>
            </div>
          </div>
        </div>

        {!lockedDifficulty && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>난이도 선택</h2>
          <div style={styles.difficultyGroup}>
            {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                style={{
                  ...styles.diffBtn,
                  ...(selected === key ? styles.diffBtnSelected : {}),
                }}
                onClick={() => setSelected(key)}
              >
                <div style={styles.diffLeft}>
                  <span style={{
                    ...styles.diffLabel,
                    ...(selected === key ? styles.diffLabelSelected : {}),
                  }}>
                    {cfg.label}
                  </span>
                  <span style={styles.diffDetail}>{DIFF_DETAILS[key]}</span>
                </div>
                {selected === key && <span style={styles.diffCheck}>✓</span>}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* 시작 버튼 */}
        <button style={styles.startBtn} onClick={() => onStart(selected)}>
          게임 시작
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
    padding: '20px 24px 40px',
    borderRadius: '0 0 32px 32px',
    marginBottom: '24px',
    position: 'relative',
  },
  backBtn: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '600',
    padding: '10px 18px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  headerIcon: {
    fontSize: '52px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 20px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  stepNumber: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFFFFF',
    background: '#1F3EE0',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '20px',
    color: '#12153D',
    flex: 1,
  },
  exampleWrap: {
    background: '#F4F6FF',
    borderRadius: '14px',
    padding: '16px 20px',
  },
  exampleLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#6876A0',
    marginBottom: '14px',
  },
  exampleRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  exampleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: '140px',
  },
  exampleSignal: {
    fontSize: '32px',
  },
  exampleArrow: {
    fontSize: '20px',
    color: '#6876A0',
    fontWeight: '700',
  },
  exampleBtn: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '8px 14px',
    textAlign: 'center',
  },
  difficultyGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  diffBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
    borderRadius: '14px',
    background: '#F4F6FF',
    border: '2px solid #E0E5F0',
    textAlign: 'left',
    cursor: 'pointer',
  },
  diffBtnSelected: {
    background: '#EEF1FE',
    border: '2px solid #1F3EE0',
  },
  diffLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  diffLabel: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#6876A0',
  },
  diffLabelSelected: {
    color: '#1F3EE0',
  },
  diffDetail: {
    fontSize: '17px',
    color: '#6876A0',
  },
  diffCheck: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1F3EE0',
  },
  startBtn: {
    width: '100%',
    padding: '20px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '22px',
    fontWeight: '800',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(31,62,224,0.35)',
    marginTop: '4px',
    cursor: 'pointer',
  },
};
