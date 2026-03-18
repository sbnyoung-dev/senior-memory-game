import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIG } from '../hooks/useMemoryGame';

const STEPS = [
  { text: '카드를 하나 눌러서 뒤집어요' },
  { text: '또 다른 카드를 눌러 짝을 찾아요' },
  { text: '같은 그림이면 짝 완성!' },
  { text: '시간 안에 모든 짝을 찾으면 게임 끝!' },
];

export default function GuideScreen({ onStart }) {
  const [selected, setSelected] = useState('easy');
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← 홈으로
        </button>
        <div style={styles.headerIcon}>🧠</div>
        <h1 style={styles.title}>기억력 카드 게임</h1>
        <p style={styles.subtitle}>뇌를 깨우는 즐거운 기억력 훈련</p>
      </div>

      <div style={styles.content}>
        {/* 게임 방법 */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>게임 방법</h2>
          <div style={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={i} style={styles.step}>
                <span style={styles.stepNumber}>{i + 1}</span>
                <span style={styles.stepText}>{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 난이도 선택 */}
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
                  <span style={styles.diffDetail}>카드 {cfg.cards} · {cfg.timeLabel}</span>
                </div>
                {selected === key && (
                  <span style={styles.diffCheck}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

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
    gap: '16px',
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
  stepIcon: {
    fontSize: '26px',
    flexShrink: 0,
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
    fontSize: '18px',
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
  },
};
