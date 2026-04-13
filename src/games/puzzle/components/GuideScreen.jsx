import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIG } from '../hooks/usePuzzleGame';

// ─── 드래그 예시 애니메이션 ───────────────────────────────────────────────────
const DC  = 58;          // 셀 크기 (px)
const DG  = 6;           // gap
const DS  = DC + DG;     // step = 64
const DP  = 5;           // 그리드 패딩
const DUR = '3.2s';

// 🌺+손가락: cell3(하단우)→cell1(상단우)  translate(DS,DS)→translate(DS,0)
// 🌼 교환:   cell1(상단우)→cell3(하단우)  translate(DS,0) →translate(DS,DS)
const DEMO_CSS = `
  @keyframes demoWrapper {
    0%    { transform: translate(${DS}px, ${DS}px) scale(1);    opacity: 0; }
    9%    { transform: translate(${DS}px, ${DS}px) scale(1.15); opacity: 1; }
    50%   { transform: translate(${DS}px, 0px)     scale(1.15); opacity: 1; }
    64%   { transform: translate(${DS}px, 0px)     scale(1);    opacity: 0; }
    100%  { transform: translate(${DS}px, ${DS}px) scale(1);    opacity: 0; }
  }
  @keyframes demoSwap {
    0%    { transform: translate(${DS}px, 0px)     scale(1);    opacity: 0; }
    9%    { transform: translate(${DS}px, 0px)     scale(1.08); opacity: 1; }
    50%   { transform: translate(${DS}px, ${DS}px) scale(1.08); opacity: 1; }
    64%   { transform: translate(${DS}px, ${DS}px) scale(1);    opacity: 0; }
    100%  { transform: translate(${DS}px, 0px)     scale(1);    opacity: 0; }
  }
  @keyframes demoSource {
    0%    { opacity: 1; }
    9%    { opacity: 0.2; }
    64%   { opacity: 0.2; }
    75%   { opacity: 1; }
    100%  { opacity: 1; }
  }
  @keyframes demoDisplace {
    0%    { opacity: 1; }
    9%    { opacity: 0.3; }
    64%   { opacity: 0.3; }
    75%   { opacity: 1; }
    100%  { opacity: 1; }
  }
`;

function PuzzleAnimDemo() {
  // 섞인 2×2 보드: cell1=🌼(잘못), cell3=🌺(잘못) → 🌺가 cell1로 이동해야 함
  const cells = ['🌸', '🌼', '🌻', '🌺'];
  const gridW  = DC * 2 + DG + DP * 2;
  const gridH  = DC * 2 + DG + DP * 2;

  return (
    <div style={styles.exampleWrap}>
      <p style={styles.exampleLabel}>예시</p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <style>{DEMO_CSS}</style>

        {/* 그리드 컨테이너 — 손가락이 아래로 삐져나오도록 overflow visible */}
        <div style={{
          position: 'relative',
          width: gridW,
          height: gridH,
          background: '#CBD2E8',
          borderRadius: 14,
          overflow: 'visible',
          marginBottom: 18, // 손가락 공간 확보
        }}>
          {/* 배경 셀들 */}
          {cells.map((emoji, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const isSource   = i === 3; // 🌺 드래그 출발지
            const isDisplace = i === 1; // 🌼 밀려나는 자리
            const anim = isSource   ? `demoSource ${DUR} ease-in-out infinite`
                       : isDisplace ? `demoDisplace ${DUR} ease-in-out infinite`
                       : 'none';
            return (
              <div key={i} style={{
                position: 'absolute',
                left: DP + col * DS,
                top:  DP + row * DS,
                width: DC,
                height: DC,
                background: '#FFFFFF',
                borderRadius: 9,
                border: '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                lineHeight: 1,
                boxShadow: '0 2px 6px rgba(0,0,0,0.09)',
                boxSizing: 'border-box',
                animation: anim,
              }}>
                {emoji}
              </div>
            );
          })}

          {/* 🌼 교환 고스트: cell1(상단우) → cell3(하단우) */}
          <div style={{
            position: 'absolute',
            left: DP,
            top:  DP,
            width: DC,
            height: DC,
            zIndex: 9,
            pointerEvents: 'none',
            animation: `demoSwap ${DUR} ease-in-out infinite`,
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: 9,
              background: '#FFF8DC',
              border: '3px solid #E0C040',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              lineHeight: 1,
              boxShadow: '0 4px 14px rgba(200,160,0,0.25)',
              boxSizing: 'border-box',
            }}>
              🌼
            </div>
          </div>

          {/* 고스트 + 손가락 래퍼 (함께 이동) */}
          <div style={{
            position: 'absolute',
            left: DP,
            top:  DP,
            width: DC,
            height: DC,
            zIndex: 10,
            pointerEvents: 'none',
            animation: `demoWrapper ${DUR} ease-in-out infinite`,
          }}>
            {/* 드래그 중인 고스트 조각 */}
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: 9,
              background: '#DBEAFE',
              border: '3px solid #1F3EE0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              lineHeight: 1,
              boxShadow: '0 6px 20px rgba(31,62,224,0.35)',
              boxSizing: 'border-box',
            }}>
              🌺
            </div>

            {/* 손가락 이모지 — 조각 아래쪽 중앙에서 위를 향해 */}
            <div style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 24,
              lineHeight: 1,
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}>
              👆
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 안내 화면 ────────────────────────────────────────────────────────────────
export default function GuideScreen({ onStart, lockedDifficulty }) {
  const [selected, setSelected] = useState(lockedDifficulty || 'easy');
  const navigate = useNavigate();

  const steps = [
    '조각을 꾹 눌러서 잡으세요',
    '완성 그림 위치로 끌어다 놓으세요',
    '모든 조각을 올바른 자리에 맞춰보세요',
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← 홈으로
        </button>
        <div style={styles.headerIcon}>🧩</div>
        <h1 style={styles.title}>퍼즐 조각 맞추기</h1>
        <p style={styles.subtitle}>시공간능력을 키우는 두뇌 훈련</p>
      </div>

      <div style={styles.content}>
        {/* 게임 방법 */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>게임 방법</h2>
          <div style={styles.steps}>
            {steps.map((text, i) => (
              <div key={i} style={styles.step}>
                <span style={styles.stepNumber}>{i + 1}</span>
                <span style={styles.stepText}>{text}</span>
              </div>
            ))}
          </div>
          <PuzzleAnimDemo />
        </div>

        {!lockedDifficulty && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>난이도 선택</h2>
          <div style={styles.difficultyGroup}>
            {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                style={{ ...styles.diffBtn, ...(selected === key ? styles.diffBtnSelected : {}) }}
                onClick={() => setSelected(key)}
              >
                <div style={styles.diffLeft}>
                  <span style={{ ...styles.diffLabel, ...(selected === key ? styles.diffLabelSelected : {}) }}>
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
    border: 'none',
    cursor: 'pointer',
  },
  headerIcon: { fontSize: '52px', marginBottom: '12px' },
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
  steps: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' },
  step: { display: 'flex', alignItems: 'center', gap: '14px' },
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
  stepText: { fontSize: '20px', color: '#12153D', flex: 1 },
  exampleWrap: {
    background: '#F4F6FF',
    borderRadius: '14px',
    padding: '16px 20px',
  },
  exampleLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#6876A0',
    marginBottom: '12px',
  },
  difficultyGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
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
  diffBtnSelected: { background: '#EEF1FE', border: '2px solid #1F3EE0' },
  diffLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  diffLabel: { fontSize: '22px', fontWeight: '700', color: '#6876A0' },
  diffLabelSelected: { color: '#1F3EE0' },
  diffDetail: { fontSize: '18px', color: '#6876A0' },
  diffCheck: { fontSize: '22px', fontWeight: '800', color: '#1F3EE0' },
  startBtn: {
    width: '100%',
    padding: '20px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '22px',
    fontWeight: '800',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(31,62,224,0.35)',
    marginTop: '4px',
  },
};
