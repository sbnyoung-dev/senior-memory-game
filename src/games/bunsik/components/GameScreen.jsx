import { useEffect } from 'react';
import { MENU_ITEMS, useBunsikGame } from '../hooks/useBunsikGame';

function fmt(n) {
  return n.toLocaleString('ko-KR') + '원';
}

export default function GameScreen({ difficulty, onEnd, onQuit }) {
  const {
    question, questionKey, phase,
    animStep, revealedCount,
    timeLeft, feedback, correctCount, totalAnswered,
    badgeKey, handleAnswer, calculateScore,
  } = useBunsikGame(difficulty);

  const isUrgent    = timeLeft <= 10 && phase === 'question';
  const showQuestion = phase === 'question' || phase === 'feedback';

  useEffect(() => {
    if (phase === 'timeout') {
      const t = setTimeout(() => onEnd(calculateScore()), 1200);
      return () => clearTimeout(t);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // 현재 터치 중인 메뉴 id
  const tappedId = animStep >= 0 ? question.selected[animStep]?.id : null;

  function getChoiceStyle(choice) {
    if (!feedback) return styles.choiceBtn;
    if (choice === question.correct) return { ...styles.choiceBtn, ...styles.choiceBtnCorrect };
    if (choice === feedback.selectedAnswer && !feedback.isCorrect) {
      return { ...styles.choiceBtn, ...styles.choiceBtnWrong };
    }
    return { ...styles.choiceBtn, ...styles.choiceBtnDim };
  }

  function getChoiceTextStyle(choice) {
    if (!feedback) return styles.choiceBtnText;
    if (choice === question.correct) return { ...styles.choiceBtnText, color: '#FFFFFF' };
    if (choice === feedback.selectedAnswer && !feedback.isCorrect) {
      return { ...styles.choiceBtnText, color: '#FFFFFF' };
    }
    return { ...styles.choiceBtnText, color: '#A0A8C0' };
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes feedbackPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tapBounce {
          0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
          55%  { transform: scale(1.25) rotate(8deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideInItem {
          0%   { opacity: 0; transform: translateX(-12px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* 시간 종료 오버레이 */}
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

      {/* 키오스크 카드 */}
      <div style={styles.kioskCard}>
        {/* 정답 배지 */}
        {feedback && feedback.isCorrect && (
          <div key={badgeKey} style={styles.correctBadge}>
            <span style={styles.correctBadgeText}>정답!</span>
          </div>
        )}

        {/* 키오스크 헤더 */}
        <div style={styles.kioskHeader}>
          <span style={styles.kioskHeaderEmoji}>🏪</span>
          <span style={styles.kioskHeaderText}>분식집 키오스크</span>
        </div>

        {/* 메뉴판 */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>📋 메뉴판</div>
          <div style={styles.menuGrid}>
            {MENU_ITEMS.map(menu => {
              const isTapped   = menu.id === tappedId;
              const isRevealed = question.selected.slice(0, revealedCount).some(m => m.id === menu.id);
              return (
                <div
                  key={menu.id}
                  style={{
                    ...styles.menuCard,
                    ...(isRevealed ? styles.menuCardRevealed : {}),
                    ...(isTapped   ? styles.menuCardTapped   : {}),
                  }}
                >
                  {isTapped && (
                    <div style={styles.fingerIcon}>👆</div>
                  )}
                  <img src={menu.image} alt={menu.name} style={styles.menuImg} />
                  <div style={styles.menuName}>{menu.name}</div>
                  <div style={styles.menuPrice}>{fmt(menu.price)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 주문 내역 */}
        {revealedCount > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🧾 주문 내역</div>
            <div style={styles.orderList}>
              {question.selected.slice(0, revealedCount).map((menu, i) => (
                <div
                  key={`${questionKey}-${i}`}
                  style={{
                    ...styles.orderRow,
                    animation: i === revealedCount - 1 ? 'slideInItem 0.3s ease-out' : 'none',
                  }}
                >
                  <span style={styles.orderName}>{menu.name}</span>
                  <span style={styles.orderPrice}>{fmt(menu.price)}</span>
                </div>
              ))}
              <div style={styles.orderDivider} />
              <div style={styles.orderTotalRow}>
                <span style={styles.orderTotalLabel}>합계</span>
                <span style={styles.orderTotalValue}>???원</span>
              </div>
              {showQuestion && question.qType === 'change' && (
                <div style={styles.paidRow}>
                  <span style={styles.paidLabel}>💵 내신 금액</span>
                  <span style={styles.paidValue}>{fmt(question.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 질문 + 4지선다 */}
        {showQuestion && (
          <div style={styles.section}>
            <div style={styles.questionText}>
              {question.qType === 'total'
                ? '총 금액은 얼마인가요?'
                : '거스름돈은 얼마인가요?'}
            </div>
            <div style={styles.choiceGrid}>
              {question.choices.map((choice, i) => (
                <button
                  key={i}
                  style={getChoiceStyle(choice)}
                  onClick={() => handleAnswer(choice)}
                  disabled={phase !== 'question'}
                >
                  <span style={getChoiceTextStyle(choice)}>{fmt(choice)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 애니메이션 중 대기 안내 */}
        {phase === 'animating' && revealedCount === 0 && (
          <div style={styles.animWaiting}>
            <span style={styles.animWaitingText}>주문을 확인하는 중...</span>
          </div>
        )}
      </div>

      <button style={styles.quitBtn} onClick={onQuit}>그만하기</button>
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
    padding: '24px 16px 48px',
    position: 'relative',
  },
  statsBar: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    maxWidth: '520px',
    marginBottom: '16px',
  },
  statBox: {
    flex: 1,
    background: '#FFFFFF',
    borderRadius: '14px',
    padding: '12px 6px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(31,62,224,0.08)',
    border: '2px solid transparent',
  },
  statBoxUrgent: { border: '2px solid #FF4D4D', background: '#FFF0F0' },
  statLabel: { display: 'block', fontSize: '14px', color: '#6876A0', marginBottom: '3px', fontWeight: '600' },
  statValue: { display: 'block', fontSize: '20px', fontWeight: '800', color: '#12153D' },
  kioskCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '520px',
    background: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    border: '2px solid #FFB300',
    overflow: 'visible',
    marginBottom: '16px',
  },
  correctBadge: {
    position: 'absolute',
    top: '52px',
    right: '12px',
    zIndex: 20,
    width: '66px',
    height: '66px',
    borderRadius: '50%',
    background: '#43A047',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    animation: 'feedbackPop 0.35s ease-out forwards',
  },
  correctBadgeText: { color: '#FFFFFF', fontSize: '18px', fontWeight: '800' },
  kioskHeader: {
    background: '#FFB300',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '18px 18px 0 0',
  },
  kioskHeaderEmoji: { fontSize: '26px' },
  kioskHeaderText: { fontSize: '20px', fontWeight: '800', color: '#5A3000' },
  section: {
    padding: '14px 16px',
    borderBottom: '1px solid #F0F2F8',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#6876A0', marginBottom: '10px' },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  menuCard: {
    position: 'relative',
    background: '#FAFAFA',
    borderRadius: '10px',
    padding: '7px 4px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '2px solid #F0F2F8',
    transition: 'border-color 0.15s, background 0.15s',
    overflow: 'visible',
  },
  menuCardRevealed: {
    background: '#FFF8E1',
    border: '2px solid #FFB300',
  },
  menuCardTapped: {
    background: '#FFF3CD',
    border: '2px solid #FF8C00',
    boxShadow: '0 0 14px rgba(255,140,0,0.45)',
    zIndex: 2,
  },
  fingerIcon: {
    position: 'absolute',
    top: '-14px',
    right: '-8px',
    fontSize: '24px',
    zIndex: 10,
    animation: 'tapBounce 0.45s ease-out forwards',
    lineHeight: 1,
  },
  menuImg: {
    width: '52px',
    height: '52px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '5px',
  },
  menuName: { fontSize: '12px', fontWeight: '700', color: '#12153D', textAlign: 'center', lineHeight: 1.2 },
  menuPrice: { fontSize: '11px', color: '#6876A0', fontWeight: '600', marginTop: '2px' },
  orderList: { display: 'flex', flexDirection: 'column' },
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 0',
    borderBottom: '1px dotted #E0E5F0',
  },
  orderName:  { fontSize: '19px', fontWeight: '600', color: '#12153D' },
  orderPrice: { fontSize: '19px', fontWeight: '700', color: '#12153D' },
  orderDivider: { height: '2px', background: '#12153D', margin: '8px 0 4px' },
  orderTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
  },
  orderTotalLabel: { fontSize: '20px', fontWeight: '800', color: '#12153D' },
  orderTotalValue: { fontSize: '24px', fontWeight: '900', color: '#FFB300' },
  paidRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#EEF1FE',
    borderRadius: '10px',
    padding: '10px 12px',
    marginTop: '8px',
  },
  paidLabel: { fontSize: '18px', fontWeight: '700', color: '#1F3EE0' },
  paidValue: { fontSize: '20px', fontWeight: '800', color: '#1F3EE0' },
  questionText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#5A3000',
    textAlign: 'center',
    background: '#FFF8E1',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '14px',
    border: '2px solid #FFB300',
  },
  choiceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  choiceBtn: {
    padding: '18px 8px',
    background: '#FFFFFF',
    border: '2px solid #E0E5F0',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background 0.15s, border-color 0.15s',
  },
  choiceBtnCorrect: { background: '#43A047', border: '2px solid #43A047' },
  choiceBtnWrong:   { background: '#E53935', border: '2px solid #E53935' },
  choiceBtnDim:     { background: '#F4F6FF', border: '2px solid #E0E5F0' },
  choiceBtnText: { fontSize: '20px', fontWeight: '800', color: '#12153D' },
  animWaiting: {
    padding: '20px',
    textAlign: 'center',
  },
  animWaitingText: { fontSize: '18px', color: '#A0A8C0', fontWeight: '600' },
  quitBtn: {
    padding: '16px 48px',
    background: '#FFFFFF',
    color: '#6876A0',
    fontSize: '18px',
    fontWeight: '700',
    borderRadius: '14px',
    border: '2px solid #E0E5F0',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
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
  overlayEmoji: { fontSize: '68px', marginBottom: '14px' },
  overlayText:  { fontSize: '30px', fontWeight: '800', color: '#12153D' },
};
