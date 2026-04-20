import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIG } from '../hooks/useMemoryGame';

const STEPS = [
  { text: '카드를 하나 눌러서 뒤집어요' },
  { text: '또 다른 카드를 눌러 짝을 찾아요' },
  { text: '같은 그림이면 짝 완성!' },
  { text: '시간 안에 모든 짝을 찾으면 게임 끝!' },
];

// ─── 예시 애니메이션 ───────────────────────────────────────────────────────────
// 카드 배치: [⭐, 🍎, 🎵, ⭐] — 0·3번 짝, 1·2번 불일치
const CARD_EMOJIS = ['⭐', '🍎', '🎵', '⭐']; // 0(좌상)·3(우하) 대각선 배치
const MEMORY_TIMINGS = [900, 600, 700, 700, 1100, 700, 700, 800, 500];
//  0: 앞면 전체 공개 (preview)
//  1: 전체 뒤집기
//  2: card[0] 클릭 (⭐ 공개)
//  3: card[3] 클릭 (⭐ 공개) → 짝!
//  4: 0·3 matched 표시 (초록)
//  5: card[1] 클릭 (🍎 공개)
//  6: card[2] 클릭 (🎵 공개) → 불일치!
//  7: 1·2 wrong 표시 (빨강)
//  8: 1·2 다시 뒤집기

function getCardStates(phase) {
  switch (phase) {
    case 0: return ['front','front','front','front'];
    case 1: return ['back','back','back','back'];
    case 2: return ['front','back','back','back'];
    case 3: return ['front','back','back','front'];
    case 4: return ['matched','back','back','matched'];
    case 5: return ['matched','front','back','matched'];
    case 6: return ['matched','front','front','matched'];
    case 7: return ['matched','wrong','wrong','matched'];
    case 8: return ['matched','back','back','matched'];
    default: return ['back','back','back','back'];
  }
}

function getActiveCard(phase) {
  if (phase === 2) return 0;
  if (phase === 3) return 3;
  if (phase === 5) return 1;
  if (phase === 6) return 2;
  return -1;
}

function MemoryAnimDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let cancelled = false;
    function advance(p) {
      setTimeout(() => {
        if (cancelled) return;
        const next = (p + 1) % MEMORY_TIMINGS.length;
        setPhase(next);
        advance(next);
      }, MEMORY_TIMINGS[p]);
    }
    advance(0);
    return () => { cancelled = true; };
  }, []);

  const states = getCardStates(phase);
  const activeCard = getActiveCard(phase);

  function cardStyle(state, isActive) {
    const base = {
      width: 62, height: 62, borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      transform: isActive ? 'scale(0.91)' : 'scale(1)',
      transition: 'background 0.25s, border-color 0.25s, transform 0.15s',
      boxSizing: 'border-box',
    };
    switch (state) {
      case 'front':   return { ...base, background: '#FFFFFF', border: '2px solid #E0E5F0' };
      case 'back':    return { ...base, background: '#1F3EE0', border: '2px solid #1a35c0' };
      case 'matched': return { ...base, background: '#E8F5E9', border: '2px solid #43A047' };
      case 'wrong':   return { ...base, background: '#FFEBEE', border: '2px solid #E53935' };
      default:        return base;
    }
  }

  function renderCardContent(idx, state) {
    if (state === 'back') {
      return <span style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF' }}>?</span>;
    }
    if (state === 'matched') {
      return (
        <>
          <span style={{ fontSize: 22 }}>{CARD_EMOJIS[idx]}</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#43A047', lineHeight: 1 }}>✓</span>
        </>
      );
    }
    if (state === 'wrong') {
      return <span style={{ fontSize: 24 }}>{CARD_EMOJIS[idx]}</span>;
    }
    return <span style={{ fontSize: 26 }}>{CARD_EMOJIS[idx]}</span>;
  }

  return (
    <div style={anim.wrap}>
      <p style={anim.label}>예시</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 62px)', gap: 10, paddingBottom: 24 }}>
        {[0, 1, 2, 3].map(idx => {
          const isActive = activeCard === idx;
          return (
            <div key={idx} style={{ position: 'relative', zIndex: isActive ? 10 : 1 }}>
              <div style={cardStyle(states[idx], isActive)}>
                {renderCardContent(idx, states[idx])}
              </div>
              <div style={{
                position: 'absolute', bottom: -22, left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 18, lineHeight: 1,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.2s',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
              }}>
                👆
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const anim = {
  wrap: {
    background: '#F4F6FF', borderRadius: 14, padding: '16px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 16, fontWeight: 700, color: '#6876A0',
    alignSelf: 'flex-start', marginBottom: 2,
  },
};

// ─── 안내 화면 ────────────────────────────────────────────────────────────────
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
          <MemoryAnimDemo />
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
                  <span style={styles.diffDetail}>카드 {cfg.cards} · {cfg.timeLabel}</span>
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
    minHeight: '100vh', background: '#F4F6FF',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  header: {
    width: '100%', background: '#1F3EE0',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px 24px 40px', borderRadius: '0 0 32px 32px',
    marginBottom: '24px', position: 'relative',
  },
  backBtn: {
    alignSelf: 'flex-start', background: 'rgba(255,255,255,0.2)', color: '#FFFFFF',
    fontSize: '18px', fontWeight: '600', padding: '10px 18px', borderRadius: '12px',
    marginBottom: '20px', border: 'none', cursor: 'pointer',
  },
  headerIcon: { fontSize: '52px', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', textAlign: 'center' },
  subtitle: { fontSize: '18px', color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  content: {
    width: '100%', maxWidth: '520px', padding: '0 20px 48px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  card: {
    background: '#FFFFFF', borderRadius: '20px', padding: '24px',
    boxShadow: '0 4px 16px rgba(31,62,224,0.08)',
  },
  cardTitle: { fontSize: '22px', fontWeight: '700', color: '#12153D', marginBottom: '20px' },
  steps: { display: 'flex', flexDirection: 'column', gap: '16px' },
  step: { display: 'flex', alignItems: 'center', gap: '14px' },
  stepNumber: {
    fontSize: '18px', fontWeight: '800', color: '#FFFFFF', background: '#1F3EE0',
    borderRadius: '50%', width: '34px', height: '34px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepText: { fontSize: '20px', color: '#12153D', flex: 1 },
  difficultyGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  diffBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 20px', borderRadius: '14px', background: '#F4F6FF',
    border: '2px solid #E0E5F0', textAlign: 'left', cursor: 'pointer',
  },
  diffBtnSelected: { background: '#EEF1FE', border: '2px solid #1F3EE0' },
  diffLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  diffLabel: { fontSize: '22px', fontWeight: '700', color: '#6876A0' },
  diffLabelSelected: { color: '#1F3EE0' },
  diffDetail: { fontSize: '18px', color: '#6876A0' },
  diffCheck: { fontSize: '22px', fontWeight: '800', color: '#1F3EE0' },
  startBtn: {
    width: '100%', padding: '20px', background: '#1F3EE0', color: '#FFFFFF',
    fontSize: '22px', fontWeight: '800', borderRadius: '16px', border: 'none',
    boxShadow: '0 6px 20px rgba(31,62,224,0.35)', marginTop: '4px', cursor: 'pointer',
  },
};
