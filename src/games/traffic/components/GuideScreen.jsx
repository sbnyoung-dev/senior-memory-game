import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIG } from '../hooks/useTrafficGame';

const DIFF_DETAILS = {
  easy:   '제한시간 60초 · 규칙 전환 1회',
  normal: '제한시간 60초 · 규칙 전환 2회',
  hard:   '제한시간 90초 · 규칙 전환 4회',
};

// ─── 예시 애니메이션 ───────────────────────────────────────────────────────────
// phase별 지속 시간(ms)
const TRAFFIC_TIMINGS = [400, 800, 900, 700, 900, 1800, 700, 800, 900, 700, 900, 600];
//  0: 일반 규칙 배지 (신호 없음)
//  1: 🟢 초록불 점등
//  2: 출발 버튼 눌림
//  3: 🔴 빨간불 점등
//  4: 멈춤 버튼 눌림
//  5: ⚠️ 규칙 바뀜 알림
//  6: 🔴 반전 규칙 배지
//  7: 🟢 초록불 점등 (반전)
//  8: 멈춤 버튼 눌림 (반전)
//  9: 🔴 빨간불 점등 (반전)
// 10: 출발 버튼 눌림 (반전)
// 11: 리셋 대기

function getBadge(phase) {
  if (phase === 5)        return { text: '⚠️ 규칙이 바뀌었어요!', bg: '#FFF3E0', color: '#E65100', border: '#FFB300' };
  if (phase >= 6)         return { text: '🔴 반전 규칙!', bg: '#FFEBEE', color: '#C62828', border: '#E53935' };
  return { text: '🔵 일반 규칙', bg: '#EEF1FE', color: '#1F3EE0', border: '#1F3EE0' };
}

function TrafficAnimDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let cancelled = false;
    function advance(p) {
      setTimeout(() => {
        if (cancelled) return;
        const next = (p + 1) % TRAFFIC_TIMINGS.length;
        setPhase(next);
        advance(next);
      }, TRAFFIC_TIMINGS[p]);
    }
    advance(0);
    return () => { cancelled = true; };
  }, []);

  // 신호등 상태
  const greenOn = (phase >= 1 && phase <= 2) || (phase >= 7 && phase <= 8);
  const redOn   = (phase >= 3 && phase <= 4) || (phase >= 9 && phase <= 10);

  // 버튼 눌림 상태
  const goPressed   = phase === 2 || phase === 10;
  const stopPressed = phase === 4 || phase === 8;

  const badge = getBadge(phase);

  return (
    <div style={{ ...anim.wrap, background: phase >= 5 ? 'rgba(226,75,74,0.08)' : '#F4F6FF', transition: 'background 0.5s' }}>
      <p style={anim.label}>예시</p>

      {/* 규칙 배지 / 경고 */}
      <div style={{
        padding: '7px 18px', borderRadius: 20, marginBottom: 12,
        fontSize: 18, fontWeight: 700,
        background: badge.bg, color: badge.color, border: `2px solid ${badge.border}`,
        transition: 'background 0.3s, color 0.3s',
        textAlign: 'center',
      }}>
        {badge.text}
      </div>

      {/* 신호등 + 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* 신호등 */}
        <div style={{
          background: '#263238', borderRadius: 14, padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: redOn ? '#E53935' : '#FFCDD2',
            boxShadow: redOn ? '0 0 16px rgba(229,57,53,0.6)' : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
          }} />
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: greenOn ? '#43A047' : '#C8E6C9',
            boxShadow: greenOn ? '0 0 16px rgba(67,160,71,0.6)' : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
          }} />
        </div>

        {/* 출발 / 멈춤 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div style={{
            padding: '12px', borderRadius: 12, textAlign: 'center',
            fontSize: 20, fontWeight: 800, color: '#FFFFFF',
            background: goPressed ? '#1a9e45' : '#1F3EE0',
            boxShadow: goPressed ? '0 4px 14px rgba(67,160,71,0.45)' : '0 2px 6px rgba(31,62,224,0.3)',
            transform: goPressed ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s',
          }}>
            🚗 출발{goPressed ? ' ✓' : ''}
          </div>
          <div style={{
            padding: '12px', borderRadius: 12, textAlign: 'center',
            fontSize: 20, fontWeight: 800, color: '#FFFFFF',
            background: stopPressed ? '#c62828' : '#E53935',
            boxShadow: stopPressed ? '0 4px 14px rgba(229,57,53,0.5)' : '0 2px 6px rgba(229,57,53,0.3)',
            transform: stopPressed ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s',
          }}>
            🛑 멈춤{stopPressed ? ' ✓' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

const anim = {
  wrap: {
    background: '#F4F6FF', borderRadius: 14, padding: '16px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  label: {
    fontSize: 16, fontWeight: 700, color: '#6876A0',
    alignSelf: 'flex-start', marginBottom: 6,
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

          <TrafficAnimDemo />
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
    minHeight: '100vh', background: '#F4F6FF',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  header: {
    width: '100%', background: '#1F3EE0',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px 24px 40px', borderRadius: '0 0 32px 32px', marginBottom: '24px',
    position: 'relative',
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
  steps: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' },
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
  diffDetail: { fontSize: '17px', color: '#6876A0' },
  diffCheck: { fontSize: '22px', fontWeight: '800', color: '#1F3EE0' },
  startBtn: {
    width: '100%', padding: '20px', background: '#1F3EE0', color: '#FFFFFF',
    fontSize: '22px', fontWeight: '800', borderRadius: '16px', border: 'none',
    boxShadow: '0 6px 20px rgba(31,62,224,0.35)', marginTop: '4px', cursor: 'pointer',
  },
};
