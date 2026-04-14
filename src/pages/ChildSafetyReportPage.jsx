import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY } from './AdmissionPage';
import BrainRadarChart from '../components/BrainRadarChart';

const AREA_LABELS = {
  memory:      '기억력',
  attention:   '주의집중력',
  language:    '언어능력',
  spatial:     '시공간능력',
  executive:   '전두엽 집행능력',
  calculation: '계산능력',
};

const CATEGORIES = ['memory', 'attention', 'language', 'spatial', 'executive', 'calculation'];

const FILIAL_MISSIONS = [
  '이번 주말엔 부모님과 함께 키오스크로\n직접 주문해보세요.\n처음엔 어색하더라도 몇 번 해보면 금방 익숙해지실 거예요.\n작은 도전이 디지털 자신감을 키워줘요!',
  '오늘 부모님께 전화해서\n오늘 훈련 결과를 함께 확인해보세요.\n어떤 게임이 재밌었는지, 어떤 게 어려웠는지 이야기 나누다 보면 더 큰 힘이 된답니다.\n부모님의 노력을 응원해주세요!',
  '이번 주 부모님과 함께 동네 한 바퀴 산책을 해보세요.\n몸을 움직이는 것도 뇌 건강에 큰 도움이 돼요.\n걸으면서 오늘 훈련 이야기도 나눠보시고 즐거운 시간 보내세요!',
  '부모님 스마트폰 앱 정리를\n함께 도와드려보세요.\n자주 쓰는 앱을 찾기 쉽게 정리해드리면 디지털 생활이 훨씬 편해진답니다.\n작은 도움이 부모님께 큰 힘이 돼요!',
];

function getSignal(score) {
  if (score >= 75) return { emoji: '🟢', label: '안심',   desc: '정상 범위예요',         color: '#43A047', bg: '#E8F5E9' };
  if (score >= 50) return { emoji: '🟡', label: '주의',   desc: '조금 더 관심 가져주세요', color: '#FB8C00', bg: '#FFF8E1' };
  return           { emoji: '🔴', label: '확인필요', desc: '함께 확인해보세요',        color: '#E53935', bg: '#FFEBEE' };
}

function getToday() {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

export default function ChildSafetyReportPage() {
  const navigate = useNavigate();
  const user   = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const scores = user.todayScores || {};

  const allDone = CATEGORIES.every(c => (scores[c] || 0) > 0);

  const randomMission = useMemo(() => {
    return FILIAL_MISSIONS[Math.floor(Math.random() * FILIAL_MISSIONS.length)];
  }, []);

  const scoreList = CATEGORIES.map(c => ({ key: c, value: scores[c] || 0 }));
  const avg = Math.round(scoreList.reduce((s, d) => s + d.value, 0) / scoreList.length);

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    navigate('/admission');
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .safety-card { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={styles.logo}>👨‍👩‍👧</span>
          <span style={styles.logoText}>자녀 안심 리포트</span>
        </div>
        <p style={styles.headerDate}>{getToday()}</p>
        <div style={styles.headerNameBadge}>
          {user.name || ''}님의 오늘 훈련 기록
        </div>
      </div>

      <div style={styles.content}>

        {/* ① 자녀 안심 지수 */}
        <div className="safety-card" style={{ ...styles.card, animationDelay: '0.1s' }}>
          <h2 style={styles.cardTitle}>① 자녀 안심 지수</h2>
          <div style={styles.safetyIndexWrap}>
            {allDone ? (
              <>
                <div style={styles.safetyBadge}>
                  <span style={styles.safetyBadgeIcon}>✅</span>
                  <span style={styles.safetyBadgeText}>훈련 완료</span>
                </div>
                <p style={styles.safetyMsg}>
                  <strong>{user.name || ''}님</strong>이 오늘 6개 영역을 모두 훈련하셨어요!
                </p>
                <div style={styles.safetyScoreRow}>
                  <span style={styles.safetyScoreLabel}>오늘 평균 점수</span>
                  <span style={styles.safetyScoreValue}>{avg}점</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ ...styles.safetyBadge, background: '#FFF3E0', borderColor: '#FB8C00' }}>
                  <span style={styles.safetyBadgeIcon}>⏳</span>
                  <span style={{ ...styles.safetyBadgeText, color: '#FB8C00' }}>훈련 진행 중</span>
                </div>
                <p style={styles.safetyMsg}>
                  아직 일부 훈련이 완료되지 않았어요.
                </p>
              </>
            )}
          </div>

          {/* 영역별 완료 현황 */}
          <div style={styles.completionGrid}>
            {scoreList.map(({ key, value }) => (
              <div
                key={key}
                style={{
                  ...styles.completionItem,
                  background: value > 0 ? '#E8F5E9' : '#F4F6FF',
                  border: `1.5px solid ${value > 0 ? '#A5D6A7' : '#D0D5E8'}`,
                }}
              >
                <span style={styles.completionIcon}>{value > 0 ? '✅' : '⬜'}</span>
                <span style={{ ...styles.completionLabel, color: value > 0 ? '#2E7D32' : '#A0A8C0' }}>
                  {AREA_LABELS[key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ② 두뇌 레이더 */}
        <div className="safety-card" style={{ ...styles.card, animationDelay: '0.2s' }}>
          <h2 style={styles.cardTitle}>② 두뇌 레이더</h2>
          <BrainRadarChart scores={scores} height={270} />

          <div style={styles.signalList}>
            {scoreList.map(({ key, value }) => {
              const sig = getSignal(value);
              return (
                <div key={key} style={{ ...styles.signalRow, background: sig.bg }}>
                  <span style={styles.signalEmoji}>{sig.emoji}</span>
                  <div style={styles.signalInfo}>
                    <span style={styles.signalArea}>{AREA_LABELS[key]}</span>
                    <span style={{ ...styles.signalDesc, color: sig.color }}>{sig.desc}</span>
                  </div>
                  <span style={{ ...styles.signalScore, color: sig.color }}>{value}점</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ③ 효도 미션 */}
        <div className="safety-card" style={{ ...styles.card, ...styles.missionCard, animationDelay: '0.3s' }}>
          <div style={styles.missionHeader}>
            <span style={styles.missionIcon}>💌</span>
            <h2 style={styles.missionTitle}>효도 미션</h2>
          </div>
          <div style={styles.missionBody}>
            <p style={styles.missionLabel}>오늘의 미션</p>
            <p style={styles.missionText}>"{randomMission}"</p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button style={styles.secondBtn} onClick={() => navigate('/')}>
          🏠 홈으로
        </button>
        <button style={styles.resetBtn} onClick={handleReset}>
          처음으로
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
    padding: '32px 24px 36px',
    borderRadius: '0 0 32px 32px',
    marginBottom: '20px',
  },
  headerTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  logo:      { fontSize: '30px' },
  logoText:  { fontSize: '22px', fontWeight: '900', color: '#FFFFFF' },
  headerDate: { fontSize: '17px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: '12px' },
  headerNameBadge: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1F3EE0',
    background: '#FFFFFF',
    padding: '8px 22px',
    borderRadius: '24px',
  },

  content: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 16px 56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(31,62,224,0.09)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#12153D',
    borderBottom: '2px solid #F0F2FA',
    paddingBottom: '12px',
    marginBottom: '4px',
  },

  // 안심 지수
  safetyIndexWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' },
  safetyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#E8F5E9',
    border: '2px solid #A5D6A7',
    borderRadius: '24px',
    padding: '10px 24px',
  },
  safetyBadgeIcon: { fontSize: '24px' },
  safetyBadgeText: { fontSize: '20px', fontWeight: '900', color: '#2E7D32' },
  safetyMsg: { fontSize: '20px', fontWeight: '700', color: '#12153D', textAlign: 'center', lineHeight: 1.6 },
  safetyScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#F4F6FF',
    borderRadius: '14px',
    padding: '12px 24px',
  },
  safetyScoreLabel: { fontSize: '18px', fontWeight: '700', color: '#6876A0' },
  safetyScoreValue: { fontSize: '26px', fontWeight: '900', color: '#1F3EE0' },

  completionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  completionItem: {
    borderRadius: '12px',
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  completionIcon:  { fontSize: '20px' },
  completionLabel: { fontSize: '13px', fontWeight: '700', textAlign: 'center', lineHeight: 1.3 },

  // 신호등
  signalList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  signalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '14px',
  },
  signalEmoji: { fontSize: '22px', flexShrink: 0 },
  signalInfo:  { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  signalArea:  { fontSize: '18px', fontWeight: '700', color: '#12153D' },
  signalDesc:  { fontSize: '14px', fontWeight: '600' },
  signalScore: { fontSize: '20px', fontWeight: '900', minWidth: '46px', textAlign: 'right', flexShrink: 0 },

  // 효도 미션
  missionCard: { background: '#FFFEF5', border: '2px dashed #FFD54F' },
  missionHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  missionIcon:   { fontSize: '28px' },
  missionTitle:  { fontSize: '20px', fontWeight: '900', color: '#12153D' },
  missionBody: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  missionLabel: { fontSize: '15px', fontWeight: '700', color: '#FB8C00' },
  missionText:  { fontSize: '19px', fontWeight: '700', color: '#12153D', lineHeight: 1.8, whiteSpace: 'pre-line' },

  // 버튼
  secondBtn: {
    width: '100%',
    padding: '18px',
    background: '#FFFFFF',
    color: '#1F3EE0',
    fontSize: '19px',
    fontWeight: '800',
    borderRadius: '16px',
    border: '2px solid #1F3EE0',
    cursor: 'pointer',
  },
  resetBtn: {
    width: '100%',
    padding: '16px',
    background: 'transparent',
    color: '#A0A8C0',
    fontSize: '18px',
    fontWeight: '700',
    borderRadius: '14px',
    border: '2px solid #D0D5E8',
    cursor: 'pointer',
  },
};
