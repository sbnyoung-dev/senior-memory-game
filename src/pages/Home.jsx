import { useNavigate } from 'react-router-dom';

const GAMES = [
  {
    id: 'memory-card',
    title: '기억력 카드 게임',
    description: '짝이 맞는 카드를 찾아보세요',
    emoji: '🧠',
    path: '/memory-card',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>🏥</div>
        <h1 style={styles.title}>Returns</h1>
        <p style={styles.subtitle}>매일 5분, 뇌를 깨우는 습관</p>
      </div>

      {/* 게임 목록 */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>게임 선택</p>
        <div style={styles.gameList}>
          {GAMES.map((game) => (
            <button
              key={game.id}
              style={styles.gameCard}
              onClick={() => navigate(game.path)}
            >
              <div style={styles.gameIconWrap}>
                <span style={styles.gameEmoji}>{game.emoji}</span>
              </div>
              <div style={styles.gameInfo}>
                <div style={styles.gameTitle}>{game.title}</div>
                <div style={styles.gameDesc}>{game.description}</div>
              </div>
              <span style={styles.arrow}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 배너 */}
      <div style={styles.banner}>
        <span style={styles.bannerIcon}>💡</span>
        <span style={styles.bannerText}>꾸준한 두뇌 훈련이 건강의 비결이에요</span>
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
    padding: '0 0 48px',
  },
  header: {
    width: '100%',
    background: '#1F3EE0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '52px 24px 44px',
    borderRadius: '0 0 32px 32px',
    marginBottom: '32px',
  },
  headerIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '34px',
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
  section: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 20px',
    marginBottom: '20px',
  },
  sectionLabel: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#6876A0',
    marginBottom: '12px',
    paddingLeft: '4px',
  },
  gameList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  gameCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 4px 16px rgba(31,62,224,0.10)',
    border: '2px solid transparent',
    textAlign: 'left',
  },
  gameIconWrap: {
    width: '64px',
    height: '64px',
    background: '#EEF1FE',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gameEmoji: {
    fontSize: '36px',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#12153D',
    marginBottom: '4px',
  },
  gameDesc: {
    fontSize: '18px',
    color: '#6876A0',
  },
  arrow: {
    fontSize: '32px',
    color: '#1F3EE0',
    fontWeight: '700',
    flexShrink: 0,
  },
  banner: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 20px',
    marginTop: '8px',
  },
  bannerInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FFF4E5',
    border: '2px solid #FFD599',
    borderRadius: '14px',
    padding: '16px 20px',
  },
  bannerIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  bannerText: {
    fontSize: '18px',
    color: '#7A4800',
    fontWeight: '600',
  },
};
