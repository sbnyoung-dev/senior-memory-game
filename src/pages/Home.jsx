import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY } from './AdmissionPage';

const GAMES = [
  { period: 1, category: 'memory',      icon: '🧠', label: '기억력',         title: '카드 뒤집기',      path: '/memory-card' },
  { period: 2, category: 'attention',   icon: '👁️', label: '주의집중력',      title: '색깔 단어 게임',   path: '/stroop'      },
  { period: 3, category: 'language',    icon: '💬', label: '언어능력',        title: '초성 게임',        path: '/chosung'     },
  { period: 4, category: 'spatial',     icon: '🗺️', label: '시공간능력',      title: '퍼즐 조각 맞추기', path: '/puzzle'      },
  { period: 5, category: 'executive',   icon: '🎯', label: '전두엽 집행능력', title: '신호등 게임',      path: '/traffic'     },
  { period: 6, category: 'calculation', icon: '🔢', label: '계산능력',        title: '분식집 키오스크',  path: '/bunsik'      },
];

const GRADE_LABEL = { 1: '1학년 · 초급', 2: '2학년 · 중급', 3: '3학년 · 고급' };

function getToday() {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

export default function Home() {
  const navigate = useNavigate();
  const user       = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const scores     = user.todayScores || {};
  const difficulty = user.difficulty || 'easy';
  const grade      = user.grade || 1;

  const completedCount = Object.values(scores).filter(s => s > 0).length;
  const allDone        = completedCount === 6;

  function handlePlay(game) {
    navigate(`${game.path}?difficulty=${difficulty}`);
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={styles.logo}>🎓</span>
          <span style={styles.logoText}>두뇌대학교</span>
        </div>
        <h1 style={styles.title}>{user.name || ''}님의 오늘 훈련 시간표</h1>
        <div style={styles.headerMeta}>
          <span style={styles.dateText}>{getToday()}</span>
          <span style={styles.gradeBadge}>{GRADE_LABEL[grade]}</span>
        </div>
        {/* 진행 바 */}
        <div style={styles.progressWrap}>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${(completedCount / 6) * 100}%` }} />
          </div>
          <span style={styles.progressText}>{completedCount} / 6 완료</span>
        </div>
      </div>

      {/* 시간표 */}
      <div style={styles.content}>
        <div style={styles.timetable}>
          {GAMES.map(game => {
            const done = (scores[game.category] || 0) > 0;
            return (
              <div key={game.category} style={{ ...styles.row, ...(done ? styles.rowDone : {}) }}>
                {/* 교시 */}
                <div style={styles.periodCol}>
                  <span style={styles.periodNum}>{game.period}</span>
                  <span style={styles.periodUnit}>교시</span>
                </div>

                {/* 구분선 */}
                <div style={styles.divider} />

                {/* 과목 정보 */}
                <div style={styles.gameInfo}>
                  <div style={styles.gameCategory}>
                    <span style={styles.gameIcon}>{game.icon}</span>
                    <span style={styles.gameCategoryLabel}>{game.label}</span>
                  </div>
                  <span style={styles.gameTitle}>{game.title}</span>
                </div>

                {/* 플레이 / 완료 버튼 */}
                {done ? (
                  <button style={styles.doneBtn} onClick={() => handlePlay(game)}>
                    완료 ✅
                  </button>
                ) : (
                  <button style={styles.playBtn} onClick={() => handlePlay(game)}>
                    ▶ 플레이
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 모두 완료 버튼 */}
        {allDone && (
          <button style={styles.reportBtn} onClick={() => navigate('/daily-report')}>
            🎉 오늘 훈련 완료! 데일리 리포트 보기
          </button>
        )}

        {/* 하단 안내 */}
        <p style={styles.notice}>순서대로 하지 않아도 괜찮아요 😊</p>

        {/* 처음으로 돌아가기 */}
        <button
          style={styles.resetBtn}
          onClick={() => { localStorage.removeItem(STORAGE_KEY); navigate('/admission'); }}
        >
          처음으로 돌아가기
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
    padding: '28px 24px 32px',
    borderRadius: '0 0 32px 32px',
    marginBottom: '20px',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  logo:     { fontSize: '28px' },
  logoText: { fontSize: '20px', fontWeight: '800', color: 'rgba(255,255,255,0.85)' },
  title: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: '12px',
    textAlign: 'center',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dateText: { fontSize: '17px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  gradeBadge: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#1F3EE0',
    background: '#FFFFFF',
    padding: '4px 14px',
    borderRadius: '20px',
  },
  progressWrap: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  progressBg: {
    width: '100%',
    height: '10px',
    background: 'rgba(255,255,255,0.25)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#FFFFFF',
    borderRadius: '6px',
    transition: 'width 0.5s ease',
  },
  progressText: { fontSize: '16px', color: 'rgba(255,255,255,0.85)', fontWeight: '700' },

  content: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 16px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  timetable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  row: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '16px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 10px rgba(31,62,224,0.08)',
    border: '2px solid transparent',
  },
  rowDone: {
    background: '#F0FFF4',
    border: '2px solid #A5D6A7',
  },
  periodCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '40px',
  },
  periodNum:  { fontSize: '22px', fontWeight: '900', color: '#1F3EE0', lineHeight: 1 },
  periodUnit: { fontSize: '14px', fontWeight: '700', color: '#6876A0' },
  divider: {
    width: '2px',
    height: '48px',
    background: '#E0E5F0',
    borderRadius: '2px',
    flexShrink: 0,
  },
  gameInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  gameCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  gameIcon:          { fontSize: '18px' },
  gameCategoryLabel: { fontSize: '15px', fontWeight: '700', color: '#6876A0' },
  gameTitle:         { fontSize: '20px', fontWeight: '800', color: '#12153D' },
  playBtn: {
    padding: '12px 18px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '800',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(31,62,224,0.3)',
  },
  doneBtn: {
    padding: '10px 14px',
    background: '#F0FFF4',
    color: '#43A047',
    fontSize: '16px',
    fontWeight: '800',
    borderRadius: '12px',
    border: '2px solid #A5D6A7',
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  reportBtn: {
    width: '100%',
    padding: '22px',
    background: '#43A047',
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: '900',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(67,160,71,0.35)',
    cursor: 'pointer',
    marginTop: '4px',
  },
  notice: {
    fontSize: '18px',
    color: '#A0A8C0',
    textAlign: 'center',
    fontWeight: '600',
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
    marginTop: '4px',
  },
};
