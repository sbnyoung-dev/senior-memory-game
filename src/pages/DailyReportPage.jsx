import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY } from './AdmissionPage';
import BrainRadarChart from '../components/BrainRadarChart';

const GAME_LABELS = {
  memory:      '기억력 카드 뒤집기',
  attention:   '색깔 단어 게임',
  language:    '초성 게임',
  spatial:     '퍼즐 조각 맞추기',
  executive:   '신호등 게임',
  calculation: '분식집 키오스크',
};

const AREA_LABELS = {
  memory:      '기억력',
  attention:   '주의집중력',
  language:    '언어능력',
  spatial:     '시공간능력',
  executive:   '전두엽 집행능력',
  calculation: '계산능력',
};

const CATEGORIES = ['memory', 'attention', 'language', 'spatial', 'executive', 'calculation'];

function getGrade(avg) {
  if (avg >= 90) return 'A+';
  if (avg >= 80) return 'A';
  if (avg >= 70) return 'B+';
  if (avg >= 60) return 'B';
  if (avg >= 50) return 'C';
  return 'F';
}

function getGradeColor(grade) {
  if (grade === 'A+' || grade === 'A') return '#1F3EE0';
  if (grade === 'B+' || grade === 'B') return '#43A047';
  if (grade === 'C') return '#FB8C00';
  return '#E53935';
}

function getSignal(score) {
  if (score >= 75) return { emoji: '🟢', label: '안심', color: '#43A047', bg: '#E8F5E9' };
  if (score >= 50) return { emoji: '🟡', label: '주의', color: '#FB8C00', bg: '#FFF8E1' };
  return { emoji: '🔴', label: '확인필요', color: '#E53935', bg: '#FFEBEE' };
}

function getActivityMessage(avg) {
  if (avg >= 80) return '오늘 뇌가 매우 활발했어요!';
  if (avg >= 60) return '오늘 뇌를 잘 깨웠어요!';
  return '내일은 더 힘내봐요!';
}

function getProfessorMessage(avg) {
  if (avg >= 90) return '오늘 정말 훌륭한 훈련을 하셨어요!\n6개 영역 모두 꾸준히 노력하신 덕분에 이렇게 좋은 결과가 나왔답니다.\n이 습관을 유지하시면 뇌 건강을 오래오래 지킬 수 있어요.\n내일도 기대할게요!';
  if (avg >= 80) return '오늘도 열심히 훈련하셨네요!\n대부분의 영역에서 좋은 실력을 보여주셨어요.\n매일 꾸준히 훈련하는 것이 뇌를 젊게 유지하는 가장 좋은 방법이에요.\n내일도 함께해요!';
  if (avg >= 70) return '오늘 훈련 잘 하셨어요!\n몇몇 영역에서 더 발전할 가능성이 보여요.\n조금씩 꾸준히 연습하다 보면 어느새 실력이 부쩍 늘어있을 거예요.\n내일도 화이팅이에요!';
  if (avg >= 60) return '오늘도 끝까지 훈련하셨네요, 대단해요!\n처음보다 훨씬 나아지고 있답니다.\n포기하지 않고 매일 조금씩 하는 것이 가장 중요해요.\n내일은 더 잘 하실 수 있어요!';
  return '오늘 훈련을 시작하셨다는 것만으로도 정말 대단한 일을 하신 거예요!\n뇌 건강은 꾸준함이 전부랍니다.\n오늘보다 내일, 내일보다 모레 조금씩 나아지면 충분해요.\n함께 해요!';
}

function getToday() {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

export default function DailyReportPage() {
  const navigate = useNavigate();
  const user   = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const scores = user.todayScores || {};

  const scoreList = CATEGORIES.map(c => ({ key: c, value: scores[c] || 0 }));
  const avg       = Math.round(scoreList.reduce((s, d) => s + d.value, 0) / scoreList.length);
  const grade     = getGrade(avg);
  const gradeColor = getGradeColor(grade);

  const maxArea = [...scoreList].sort((a, b) => b.value - a.value)[0];
  const minArea = [...scoreList].sort((a, b) => a.value - b.value)[0];

  const [stampVisible, setStampVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStampVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes stampIn {
          0%   { transform: rotate(-12deg) scale(0);    opacity: 0; }
          65%  { transform: rotate(-8deg)  scale(1.2);  opacity: 1; }
          100% { transform: rotate(-8deg)  scale(1);    opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .report-card { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={styles.logo}>🎓</span>
          <span style={styles.logoText}>두뇌대학교</span>
        </div>
        <h1 style={styles.headerTitle}>데일리 리포트</h1>
        <p style={styles.headerDate}>{getToday()}</p>
      </div>

      <div style={styles.content}>

        {/* ① 오늘의 학점 */}
        <div className="report-card" style={{ ...styles.card, animationDelay: '0.1s' }}>
          <h2 style={styles.cardTitle}>① 오늘의 학점</h2>
          {/* 성적표 */}
          <div style={styles.transcript}>
            <div style={styles.transcriptHeader}>
              <span style={styles.transcriptHeaderText}>과목</span>
              <span style={styles.transcriptHeaderText}>점수</span>
            </div>
            {scoreList.map(({ key, value }) => (
              <div key={key} style={styles.transcriptRow}>
                <span style={styles.transcriptSubject}>{GAME_LABELS[key]}</span>
                <span style={styles.transcriptScore}>{value}점</span>
              </div>
            ))}
            <div style={styles.transcriptFooter}>
              <span style={styles.transcriptAvgLabel}>종합 평균</span>
              <span style={styles.transcriptAvg}>{avg}점</span>
            </div>
          </div>

          {/* 학점 + 도장 */}
          <div style={styles.gradeRow}>
            <div style={styles.gradeBox}>
              <span style={styles.gradeLabel}>최종 학점</span>
              <span style={{ ...styles.gradeValue, color: gradeColor }}>{grade}</span>
            </div>
            {stampVisible && (
              <div style={{ ...styles.stamp, borderColor: gradeColor, color: gradeColor, animation: 'stampIn 0.5s ease forwards' }}>
                {grade}
              </div>
            )}
          </div>
        </div>

        {/* ② 두뇌 활성도 */}
        <div className="report-card" style={{ ...styles.card, animationDelay: '0.2s' }}>
          <h2 style={styles.cardTitle}>② 두뇌 활성도</h2>
          <div style={styles.activityWrap}>
            <div style={styles.activityScoreCircle}>
              <span style={styles.activityScore}>{avg}점</span>
            </div>
            <p style={styles.activityMsg}>{getActivityMessage(avg)}</p>
          </div>
        </div>

        {/* ③ 두뇌 레이더 */}
        <div className="report-card" style={{ ...styles.card, animationDelay: '0.3s' }}>
          <h2 style={styles.cardTitle}>③ 두뇌 레이더</h2>
          <BrainRadarChart scores={scores} height={280} />
          <div style={styles.signalList}>
            {scoreList.map(({ key, value }) => {
              const sig = getSignal(value);
              return (
                <div key={key} style={{ ...styles.signalRow, background: sig.bg }}>
                  <span style={styles.signalEmoji}>{sig.emoji}</span>
                  <span style={styles.signalArea}>{AREA_LABELS[key]}</span>
                  <span style={{ ...styles.signalBadge, color: sig.color, border: `1.5px solid ${sig.color}` }}>
                    {sig.label}
                  </span>
                  <span style={{ ...styles.signalScore, color: sig.color }}>{value}점</span>
                </div>
              );
            })}
          </div>
          <div style={styles.signalSummary}>
            <p style={styles.signalHighMsg}>
              🏆 <strong>{AREA_LABELS[maxArea.key]}</strong>이(가) 오늘 가장 활발했어요!
            </p>
            <p style={styles.signalLowMsg}>
              💪 <strong>{AREA_LABELS[minArea.key]}</strong>을(를) 더 훈련해보세요!
            </p>
          </div>
        </div>

        {/* ④ 교수님 한마디 */}
        <div className="report-card" style={{ ...styles.card, ...styles.letterCard, animationDelay: '0.4s' }}>
          <div style={styles.letterHeader}>
            <span style={styles.letterIcon}>📬</span>
            <h2 style={styles.letterTitle}>④ 교수님 한마디</h2>
          </div>
          <div style={styles.letterBody}>
            <p style={styles.letterGreeting}>{user.name || ''}님께,</p>
            <p style={styles.letterText}>{getProfessorMessage(avg)}</p>
            <p style={styles.letterSign}>— 두뇌대학교 교수님 드림</p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button style={styles.nextBtn} onClick={() => navigate('/child-safety-report')}>
          👨‍👩‍👧 자녀 안심 리포트 보기
        </button>
        <button style={styles.secondBtn} onClick={() => navigate('/')}>
          🏠 홈으로
        </button>
        <button
          style={styles.resetBtn}
          onClick={() => { localStorage.removeItem(STORAGE_KEY); navigate('/admission'); }}
        >
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
  headerTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  logo:       { fontSize: '28px' },
  logoText:   { fontSize: '20px', fontWeight: '800', color: 'rgba(255,255,255,0.85)' },
  headerTitle: { fontSize: '26px', fontWeight: '900', color: '#FFFFFF', marginBottom: '8px' },
  headerDate:  { fontSize: '17px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

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

  // 성적표
  transcript: {
    border: '2px solid #E0E5F0',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  transcriptHeader: {
    background: '#1F3EE0',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
  },
  transcriptHeaderText: { fontSize: '16px', fontWeight: '800', color: '#FFFFFF' },
  transcriptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: '1px solid #F0F2FA',
  },
  transcriptSubject: { fontSize: '18px', fontWeight: '600', color: '#12153D' },
  transcriptScore:   { fontSize: '18px', fontWeight: '800', color: '#1F3EE0' },
  transcriptFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: '#F4F6FF',
  },
  transcriptAvgLabel: { fontSize: '18px', fontWeight: '800', color: '#12153D' },
  transcriptAvg:      { fontSize: '22px', fontWeight: '900', color: '#1F3EE0' },

  // 학점 & 도장
  gradeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 8px 0',
  },
  gradeBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  gradeLabel: { fontSize: '16px', fontWeight: '700', color: '#6876A0' },
  gradeValue: { fontSize: '52px', fontWeight: '900', lineHeight: 1 },
  stamp: {
    fontSize: '36px',
    fontWeight: '900',
    padding: '12px 22px',
    borderRadius: '12px',
    border: '4px solid',
    letterSpacing: '2px',
    opacity: 0,
  },

  // 두뇌 활성도
  activityWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '8px',
  },
  activityScoreCircle: {
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    background: '#EEF1FE',
    border: '4px solid #1F3EE0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityScore: { fontSize: '38px', fontWeight: '900', color: '#1F3EE0', lineHeight: 1 },
  activityMsg: { fontSize: '20px', fontWeight: '800', color: '#12153D', textAlign: 'center' },

  // 신호등
  signalList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  signalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '14px',
  },
  signalEmoji: { fontSize: '22px', flexShrink: 0 },
  signalArea:  { flex: 1, fontSize: '18px', fontWeight: '700', color: '#12153D' },
  signalBadge: {
    fontSize: '14px',
    fontWeight: '800',
    padding: '3px 10px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  signalScore: { fontSize: '18px', fontWeight: '900', minWidth: '44px', textAlign: 'right', flexShrink: 0 },
  signalSummary: {
    background: '#F4F6FF',
    borderRadius: '14px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  signalHighMsg: { fontSize: '18px', fontWeight: '700', color: '#12153D', lineHeight: 1.5 },
  signalLowMsg:  { fontSize: '18px', fontWeight: '700', color: '#12153D', lineHeight: 1.5 },

  // 편지
  letterCard: { background: '#FFFEF5', border: '2px dashed #FFD54F' },
  letterHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  letterIcon:   { fontSize: '28px' },
  letterTitle:  { fontSize: '20px', fontWeight: '900', color: '#12153D' },
  letterBody: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  letterGreeting: { fontSize: '19px', fontWeight: '800', color: '#1F3EE0' },
  letterText:     { fontSize: '19px', fontWeight: '600', color: '#12153D', lineHeight: 1.8, whiteSpace: 'pre-line' },
  letterSign:     { fontSize: '17px', fontWeight: '700', color: '#6876A0', textAlign: 'right', marginTop: '4px' },

  // 버튼
  nextBtn: {
    width: '100%',
    padding: '22px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: '900',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(31,62,224,0.35)',
    cursor: 'pointer',
    marginTop: '4px',
  },
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
    fontSize: '17px',
    fontWeight: '700',
    borderRadius: '14px',
    border: '2px solid #D0D5E8',
    cursor: 'pointer',
  },
};
