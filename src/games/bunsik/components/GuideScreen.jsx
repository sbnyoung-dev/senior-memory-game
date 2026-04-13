import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_CONFIG } from '../hooks/useBunsikGame';

const DIFF_DETAILS = {
  easy:   '2가지 메뉴 · 총액 계산 · 60초',
  normal: '3가지 메뉴 · 총액/거스름돈 · 60초',
  hard:   '4가지 메뉴 · 총액/거스름돈 · 90초',
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
        <div style={styles.headerIcon}>🏪</div>
        <h1 style={styles.title}>분식집 계산 게임</h1>
        <p style={styles.subtitle}>계산능력을 키우는 두뇌 훈련</p>
      </div>

      <div style={styles.content}>
        {/* 게임 방법 */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>게임 방법</h2>
          <div style={styles.steps}>
            <div style={styles.step}>
              <span style={styles.stepNum}>1</span>
              <span style={styles.stepText}>메뉴판을 보고 총 금액 또는 거스름돈이 얼마인지 맞춰보세요.</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNum}>2</span>
              <span style={styles.stepText}>난이도가 올라갈수록 주문 메뉴가 많아져요!</span>
            </div>
          </div>

          {/* 예시 박스 */}
          <div style={styles.exampleWrap}>
            <p style={styles.exampleLabel}>예시</p>
            <div style={styles.exampleKiosk}>
              <div style={styles.exampleKioskHeader}>🏪 분식집 키오스크</div>
              <div style={styles.exampleOrderRow}>
                <span>김밥</span><span>3,000원</span>
              </div>
              <div style={styles.exampleOrderRow}>
                <span>떡볶이</span><span>4,000원</span>
              </div>
              <div style={styles.exampleDivider} />
              <div style={styles.exampleTotalRow}>
                <span>합계</span><span style={styles.exampleTotalAmt}>???원</span>
              </div>
              <div style={styles.exampleQuestion}>총 금액은 얼마인가요?</div>
            </div>
          </div>
        </div>

        {!lockedDifficulty && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>난이도 선택</h2>
          <div style={styles.diffGroup}>
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
    cursor: 'pointer',
    border: 'none',
  },
  headerIcon: { fontSize: '52px', marginBottom: '12px' },
  title: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: { fontSize: '18px', color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
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
  cardTitle: { fontSize: '22px', fontWeight: '700', color: '#12153D', marginBottom: '20px' },
  steps: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
  stepNum: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFFFFF',
    background: '#1F3EE0',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    minWidth: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: '19px', color: '#12153D', paddingTop: '6px' },
  exampleWrap: { background: '#F4F6FF', borderRadius: '14px', padding: '16px' },
  exampleLabel: { fontSize: '15px', fontWeight: '700', color: '#6876A0', marginBottom: '12px' },
  exampleKiosk: {
    background: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #FFB300',
  },
  exampleKioskHeader: {
    background: '#FFB300',
    padding: '10px 14px',
    fontSize: '16px',
    fontWeight: '800',
    color: '#5A3000',
  },
  exampleOrderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 14px',
    fontSize: '17px',
    fontWeight: '600',
    color: '#12153D',
    borderBottom: '1px dotted #E0E5F0',
  },
  exampleDivider: { height: '2px', background: '#12153D', margin: '4px 14px' },
  exampleTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 14px',
    fontSize: '18px',
    fontWeight: '800',
    color: '#12153D',
  },
  exampleTotalAmt: { color: '#FFB300', fontSize: '20px', fontWeight: '900' },
  exampleQuestion: {
    background: '#FFF8E1',
    padding: '10px 14px',
    fontSize: '17px',
    fontWeight: '700',
    color: '#5A3000',
    textAlign: 'center',
    borderTop: '1px solid #FFB300',
  },
  diffGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
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
  diffDetail: { fontSize: '17px', color: '#6876A0' },
  diffCheck: { fontSize: '22px', fontWeight: '800', color: '#1F3EE0' },
  startBtn: {
    width: '100%',
    padding: '20px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '22px',
    fontWeight: '800',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(31,62,224,0.35)',
    border: 'none',
    cursor: 'pointer',
    marginTop: '4px',
  },
};
