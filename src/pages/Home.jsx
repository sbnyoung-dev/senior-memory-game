import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'memory',
    label: '기억력',
    icon: '🧠',
    games: [
      {
        id: 'memory-card',
        title: '카드 뒤집기 게임',
        emoji: '🃏',
        path: '/memory-card',
        active: true,
      },
    ],
  },
  {
    id: 'attention',
    label: '주의 집중력',
    icon: '👁️',
    games: [
      {
        id: 'color-word',
        title: '색깔 단어 게임',
        emoji: '🎨',
        path: '/stroop',
        active: true,
      },
    ],
  },
  {
    id: 'language',
    label: '언어 능력',
    icon: '💬',
    games: [
      {
        id: 'initial-consonant',
        title: '초성 게임',
        emoji: '✏️',
        path: '/chosung',
        active: true,
      },
    ],
  },
  {
    id: 'spatial',
    label: '시공간 능력',
    icon: '🎲',
    games: [
      {
        id: 'puzzle',
        title: '퍼즐 조각 맞추기',
        emoji: '🧩',
        path: '/puzzle',
        active: true,
      },
    ],
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

      {/* 카테고리 목록 */}
      <div style={styles.content}>
        {CATEGORIES.map((cat) => (
          <div key={cat.id} style={styles.section}>
            {/* 카테고리 헤더 */}
            <div style={styles.categoryHeader}>
              <span style={styles.categoryIcon}>{cat.icon}</span>
              <span style={styles.categoryLabel}>{cat.label}</span>
              <span style={styles.gameCount}>게임 {cat.games.length}개</span>
            </div>

            {/* 게임 목록 */}
            <div style={styles.gameList}>
              {cat.games.map((game) => (
                <button
                  key={game.id}
                  style={{
                    ...styles.gameCard,
                    ...(game.active ? {} : styles.gameCardDisabled),
                  }}
                  onClick={() => game.active && navigate(game.path)}
                  disabled={!game.active}
                >
                  <div style={{
                    ...styles.gameIconWrap,
                    ...(game.active ? {} : styles.gameIconWrapDisabled),
                  }}>
                    <span style={styles.gameEmoji}>{game.emoji}</span>
                  </div>
                  <div style={styles.gameInfo}>
                    <div style={{
                      ...styles.gameTitle,
                      ...(game.active ? {} : styles.gameTitleDisabled),
                    }}>
                      {game.title}
                    </div>
                    {!game.active && (
                      <div style={styles.comingSoon}>준비 중</div>
                    )}
                  </div>
                  {game.active
                    ? <span style={styles.arrow}>›</span>
                    : <span style={styles.lock}>🔒</span>
                  }
                </button>
              ))}
            </div>
          </div>
        ))}
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
  content: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '4px',
  },
  categoryIcon: {
    fontSize: '22px',
  },
  categoryLabel: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#12153D',
    flex: 1,
  },
  gameCount: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6876A0',
    background: '#E8ECFC',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  gameList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
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
    cursor: 'pointer',
  },
  gameCardDisabled: {
    background: '#F0F2FA',
    boxShadow: 'none',
    border: '2px solid #E0E5F0',
    cursor: 'default',
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
  gameIconWrapDisabled: {
    background: '#E4E8F5',
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
  },
  gameTitleDisabled: {
    color: '#A0A8C0',
  },
  comingSoon: {
    fontSize: '16px',
    color: '#A0A8C0',
    marginTop: '4px',
    fontWeight: '600',
  },
  arrow: {
    fontSize: '32px',
    color: '#1F3EE0',
    fontWeight: '700',
    flexShrink: 0,
  },
  lock: {
    fontSize: '24px',
    flexShrink: 0,
  },
  banner: {
    width: '100%',
    maxWidth: '520px',
    padding: '0 20px',
    marginTop: '8px',
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
