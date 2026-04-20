import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIG } from '../hooks/useChosungGame';

// ─── 예시 애니메이션 ───────────────────────────────────────────────────────────
const CHOSUNG_TIMINGS = [500, 700, 700, 1000, 500];
// 0: 카테고리 배지 | 1: +초성 등장 | 2: +보기 등장 | 3: 정답 강조 | 4: 리셋 대기

function ChosungAnimDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let cancelled = false;
    function advance(p) {
      setTimeout(() => {
        if (cancelled) return;
        const next = (p + 1) % CHOSUNG_TIMINGS.length;
        setPhase(next);
        advance(next);
      }, CHOSUNG_TIMINGS[p]);
    }
    advance(0);
    return () => { cancelled = true; };
  }, []);

  const choices = ['김치', '가치', '국자', '고추'];
  const correct = '김치';

  return (
    <div style={anim.wrap}>
      <p style={anim.label}>예시</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
        {/* 카테고리 배지 */}
        <div style={{
          background: '#FFF8E1', border: '2px solid #FFB300',
          borderRadius: 20, padding: '6px 18px',
          fontSize: 18, fontWeight: 700, color: '#5A3000',
          opacity: phase >= 0 ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          음식 🍳
        </div>

        {/* 초성 */}
        <div style={{
          fontSize: 40, fontWeight: 900, color: '#1F3EE0',
          letterSpacing: 18, lineHeight: 1,
          opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          ㄱ ㅊ
        </div>

        {/* 보기 버튼 4개 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%',
          opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          {choices.map(w => {
            const selected = phase >= 3 && w === correct;
            return (
              <div key={w} style={{
                padding: '11px 8px', borderRadius: 12, textAlign: 'center',
                fontSize: 20, fontWeight: 800,
                background: selected ? '#E8F5E9' : '#FFFFFF',
                border: `2px solid ${selected ? '#43A047' : '#E0E5F0'}`,
                color: selected ? '#2E7D32' : '#12153D',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.25s',
              }}>
                {w}{selected ? ' ✓' : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const anim = {
  wrap: {
    background: '#F4F6FF', borderRadius: 14, padding: '16px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
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
        <div style={styles.headerIcon}>✏️</div>
        <h1 style={styles.title}>초성 게임</h1>
        <p style={styles.subtitle}>언어능력을 키우는 두뇌 훈련</p>
      </div>

      <div style={styles.content}>
        {/* 게임 방법 */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>게임 방법</h2>
          <div style={styles.steps}>
            <div style={styles.step}>
              <span style={styles.stepNumber}>1</span>
              <span style={styles.stepText}>초성을 보고 알맞은 단어를 찾으세요!</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNumber}>2</span>
              <span style={styles.stepText}>힌트를 참고하면 더 쉽게 풀 수 있어요</span>
            </div>
          </div>

          <ChosungAnimDemo />
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
                  <span style={styles.diffDetail}>{cfg.detail}</span>
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
  diffDetail: { fontSize: '18px', color: '#6876A0' },
  diffCheck: { fontSize: '22px', fontWeight: '800', color: '#1F3EE0' },
  startBtn: {
    width: '100%', padding: '20px', background: '#1F3EE0', color: '#FFFFFF',
    fontSize: '22px', fontWeight: '800', borderRadius: '16px', border: 'none',
    boxShadow: '0 6px 20px rgba(31,62,224,0.35)', marginTop: '4px', cursor: 'pointer',
  },
};
