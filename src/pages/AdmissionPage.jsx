import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const STORAGE_KEY = 'brainUniversity_user';
const CURRENT_YEAR = new Date().getFullYear();

export default function AdmissionPage() {
  const [name, setName]           = useState('');
  const [birthYear, setBirthYear] = useState('');
  const navigate = useNavigate();

  const yearNum = parseInt(birthYear);
  const age     = birthYear.length === 4 && !isNaN(yearNum) ? CURRENT_YEAR - yearNum : null;
  const isValid = name.trim().length > 0 && age !== null && age >= 10 && age <= 110;

  function handleSubmit() {
    if (!isValid) return;
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...existing,
      name: name.trim(),
      birthYear: yearNum,
      age,
      todayScores: { memory: 0, attention: 0, language: 0, spatial: 0, executive: 0, calculation: 0 },
    }));
    navigate('/exam');
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.logoCircle}>🎓</div>
        <h1 style={styles.title}>두뇌대학교</h1>
        <p style={styles.subtitle}>입학 지원서</p>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <p style={styles.cardDesc}>
            아래 정보를 입력하면 맞춤형 두뇌 훈련을 시작할 수 있어요!
          </p>

          {/* 이름 */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>이름</label>
            <input
              style={styles.input}
              type="text"
              placeholder="예) 홍길동"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* 출생년도 */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>출생년도</label>
            <input
              style={styles.input}
              type="number"
              placeholder="예) 1955"
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              min="1920"
              max={CURRENT_YEAR}
            />
            {age !== null && age >= 10 && age <= 110 && (
              <div style={styles.ageTag}>만 {age}세</div>
            )}
          </div>
        </div>

        <button
          style={{ ...styles.submitBtn, opacity: isValid ? 1 : 0.4, cursor: isValid ? 'pointer' : 'default' }}
          onClick={handleSubmit}
          disabled={!isValid}
        >
          입학 지원하기
        </button>

        <p style={styles.notice}>
          입력하신 정보는 게임 경험 개선에만 사용돼요
        </p>
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
    padding: '52px 24px 48px',
    borderRadius: '0 0 36px 36px',
    marginBottom: '28px',
  },
  logoCircle: {
    fontSize: '64px',
    marginBottom: '14px',
  },
  title: {
    fontSize: '34px',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    background: 'rgba(255,255,255,0.15)',
    padding: '8px 24px',
    borderRadius: '20px',
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
    borderRadius: '24px',
    padding: '28px 24px',
    boxShadow: '0 4px 20px rgba(31,62,224,0.10)',
  },
  cardDesc: {
    fontSize: '18px',
    color: '#6876A0',
    marginBottom: '24px',
    lineHeight: 1.6,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '20px',
    fontWeight: '700',
    color: '#12153D',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '18px 16px',
    fontSize: '22px',
    fontWeight: '600',
    border: '2px solid #E0E5F0',
    borderRadius: '16px',
    outline: 'none',
    color: '#12153D',
    background: '#FAFBFF',
    boxSizing: 'border-box',
  },
  ageTag: {
    display: 'inline-block',
    marginTop: '10px',
    background: '#EEF1FE',
    color: '#1F3EE0',
    fontSize: '20px',
    fontWeight: '800',
    padding: '8px 20px',
    borderRadius: '12px',
  },
  submitBtn: {
    width: '100%',
    padding: '22px',
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: '900',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(31,62,224,0.35)',
    letterSpacing: '1px',
  },
  notice: {
    fontSize: '17px',
    color: '#A0A8C0',
    textAlign: 'center',
    fontWeight: '500',
  },
};
