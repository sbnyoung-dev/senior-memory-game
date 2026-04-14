import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY } from './AdmissionPage';

// ─── 정적 데이터 ──────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STROOP_ITEMS = [
  { word: '빨강', ink: '#2962FF', inkName: '파랑' },
  { word: '초록', ink: '#E53935', inkName: '빨강' },
  { word: '노랑', ink: '#00897B', inkName: '초록' },
  { word: '파랑', ink: '#F9A825', inkName: '노랑' },
];

const CHOSUNG_ITEMS = [
  { chosung: 'ㅅ · ㄱ', hint: '🍎', answer: '사과', choices: ['사과', '수박', '딸기', '포도'] },
  { chosung: 'ㄴ · ㅂ', hint: '🦋', answer: '나비', choices: ['나비', '나방', '나팔', '자비'] },
  { chosung: 'ㄱ · ㅊ', hint: '🚂', answer: '기차', choices: ['기차', '기초', '기침', '고추'] },
  { chosung: 'ㅂ · ㅅ', hint: '❄️', answer: '빙수', choices: ['빙수', '빙산', '봄비', '방송'] },
];

const EXECUTIVE_ITEMS = [
  {
    rule: '과일만 고르세요',
    answer: '사과',
    choices: [
      { emoji: '🍎', name: '사과' }, { emoji: '🚗', name: '자동차' },
      { emoji: '✏️', name: '연필' }, { emoji: '🎵', name: '음악' },
    ],
  },
  {
    rule: '동물만 고르세요',
    answer: '고양이',
    choices: [
      { emoji: '🌹', name: '장미' }, { emoji: '🐱', name: '고양이' },
      { emoji: '🏠', name: '집' }, { emoji: '⚽', name: '축구공' },
    ],
  },
  {
    rule: '탈것만 고르세요',
    answer: '비행기',
    choices: [
      { emoji: '🍕', name: '피자' }, { emoji: '📚', name: '책' },
      { emoji: '✈️', name: '비행기' }, { emoji: '🌺', name: '꽃' },
    ],
  },
];

// 총액 계산 문제 (거스름돈 제거)
const CALC_ITEMS = [
  { items: [{ name: '김밥', price: 3000 }, { name: '떡볶이', price: 4000 }] },
  { items: [{ name: '라면', price: 4500 }, { name: '순대', price: 3500 }] },
  { items: [{ name: '어묵', price: 1000 }, { name: '음료수', price: 1500 }] },
];

const Q_META = [
  { id: 'memory',    label: '기억력',        emoji: '🧠', timeSec: 10, hasShowing: true,
    hint: '없는 숫자를 고르세요',       intro: '숫자를 기억하세요!' },
  { id: 'attention', label: '주의집중력',     emoji: '👁️', timeSec: 8,  hasShowing: false,
    hint: '글자의 색깔이 무엇인가요?',  intro: '글자 색깔을 고르세요!' },
  { id: 'language',  label: '언어능력',       emoji: '💬', timeSec: 15, hasShowing: false,
    hint: '어떤 단어일까요?',           intro: '초성을 보고 단어를 맞춰보세요!' },
  { id: 'spatial',   label: '시공간능력',     emoji: '🎲', timeSec: 12, hasShowing: true,
    hint: '색칠된 칸을 다시 눌러보세요', intro: '패턴을 기억하세요!' },
  { id: 'executive', label: '전두엽 집행능력', emoji: '🎯', timeSec: 10, hasShowing: false,
    hint: '규칙에 맞는 것을 고르세요', intro: '규칙을 잘 읽고 고르세요!' },
  { id: 'calculation', label: '계산능력',     emoji: '🧮', timeSec: 20, hasShowing: false,
    hint: '총액이 얼마인가요?',         intro: '금액을 계산해보세요!' },
];

// ─── 시험 데이터 생성 ─────────────────────────────────────────────────────────

// 정답을 먼저 고정하고 나머지 3개를 랜덤으로 채우는 방식
function genCalcChoices(correct) {
  const set = new Set([correct]);
  const offs = shuffle([500, 1000, 1500, 2000, 2500, 3000]);
  for (const o of offs) {
    if (set.size >= 4) break;
    const cands = [correct + o, correct - o].filter(v => v > 0 && !set.has(v));
    if (cands.length) set.add(shuffle(cands)[0]);
  }
  let extra = 500;
  while (set.size < 4) {
    if (!set.has(correct + extra)) set.add(correct + extra);
    extra += 500;
  }
  return shuffle([...set]);
}

function generateExamData() {
  // Q1: 기억력 - 숫자 4개 보여주고, 없는 숫자 찾기
  const numPool  = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const shown    = numPool.slice(0, 4);
  const notShown = numPool[4];
  const q1Choices = shuffle([...shuffle(shown).slice(0, 3), notShown]);

  // Q2: 주의집중력 - 스트룹
  const q2Raw     = STROOP_ITEMS[Math.floor(Math.random() * STROOP_ITEMS.length)];
  const q2Choices = shuffle(['빨강', '파랑', '초록', '노랑']);

  // Q3: 언어능력 - 초성 퀴즈
  const q3Raw     = CHOSUNG_ITEMS[Math.floor(Math.random() * CHOSUNG_ITEMS.length)];
  const q3Choices = shuffle([...q3Raw.choices]);

  // Q4: 시공간능력 - 3x3 패턴
  const q4Target = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3);

  // Q5: 전두엽 집행능력 - 규칙 선택
  const q5Raw     = EXECUTIVE_ITEMS[Math.floor(Math.random() * EXECUTIVE_ITEMS.length)];
  const q5Choices = shuffle([...q5Raw.choices]);

  // Q6: 계산능력 - 총액 계산 (정답 먼저 고정 후 나머지 랜덤)
  const q6Raw   = CALC_ITEMS[Math.floor(Math.random() * CALC_ITEMS.length)];
  const q6Total = q6Raw.items.reduce((s, it) => s + it.price, 0);

  return {
    q1: { shown, notShown, choices: q1Choices },
    q2: { ...q2Raw, choices: q2Choices },
    q3: { ...q3Raw, choices: q3Choices },
    q4: { target: q4Target },
    q5: { ...q5Raw, choices: q5Choices },
    q6: { items: q6Raw.items, total: q6Total, choices: genCalcChoices(q6Total) },
  };
}

function checkAnswer(qIdx, choice, data) {
  if (choice === null || choice === undefined) return false;
  switch (qIdx) {
    case 0: return choice === data.q1.notShown;
    case 1: return choice === data.q2.inkName;
    case 2: return choice === data.q3.answer;
    case 3: {
      if (!Array.isArray(choice) || choice.length !== 3) return false;
      const t = data.q4.target;
      return choice.every(v => t.includes(v)) && t.every(v => choice.includes(v));
    }
    case 4: return choice === data.q5.answer;
    case 5: return choice === data.q6.total;
    default: return false;
  }
}

function getCorrectAnswer(qIdx, data) {
  switch (qIdx) {
    case 0: return data.q1.notShown;
    case 1: return data.q2.inkName;
    case 2: return data.q3.answer;
    case 3: return data.q4.target;
    case 4: return data.q5.answer;
    case 5: return data.q6.total;
    default: return null;
  }
}

function calculateGrade(answers) {
  const correctCount = answers.filter(a => a.isCorrect).length;
  const avgRatio = answers.reduce((s, a) => s + a.responseTime / a.timeLimitMs, 0) / answers.length;
  if (correctCount >= 5 && avgRatio < 0.6) return 3;
  if (correctCount >= 3) return 2;
  return 1;
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function EntranceExamPage() {
  const navigate = useNavigate();
  const [examData]    = useState(() => generateExamData());

  const [currentQ,   setCurrentQ]   = useState(0);
  const [subPhase,   setSubPhase]   = useState('intro'); // 'intro' | 'showing' | 'answering'
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [q4Selected, setQ4Selected] = useState([]);
  const [feedback,   setFeedback]   = useState(null); // { isCorrect, selectedChoice, correctAnswer }

  const currentQRef      = useRef(0);
  const subPhaseRef      = useRef('intro');
  const answersRef       = useRef([]);
  const q4SelectedRef    = useRef([]);
  const questionStartRef = useRef(0);
  const timerRef         = useRef(null);
  const feedbackTimerRef = useRef(null);
  const feedbackRef      = useRef(false); // 피드백 중 중복 입력 방지
  const examDataRef      = useRef(examData);

  function clearTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }
  function clearFeedbackTimer() {
    if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; }
  }

  function startAnsweringPhase() {
    const meta = Q_META[currentQRef.current];
    questionStartRef.current = Date.now();
    subPhaseRef.current = 'answering';
    setSubPhase('answering');
    setTimeLeft(meta.timeSec);

    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setTimeout(() => handleTimeoutInternal(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleTimeoutInternal() {
    if (subPhaseRef.current !== 'answering') return;
    if (feedbackRef.current) return;
    const qIdx = currentQRef.current;
    const responseTime = Date.now() - questionStartRef.current;
    const isCorrect = qIdx === 3
      ? checkAnswer(3, q4SelectedRef.current, examDataRef.current)
      : false;
    submitAnswer(isCorrect, responseTime);
  }

  function submitAnswer(isCorrect, responseTime) {
    clearTimer();
    const qIdx = currentQRef.current;
    const answer = { isCorrect, responseTime, timeLimitMs: Q_META[qIdx].timeSec * 1000 };
    answersRef.current = [...answersRef.current, answer];

    if (qIdx < 5) {
      const nextQ = qIdx + 1;
      currentQRef.current = nextQ;
      subPhaseRef.current = 'intro';
      q4SelectedRef.current = [];
      feedbackRef.current = false;
      setQ4Selected([]);
      setFeedback(null);
      setCurrentQ(nextQ);
      setSubPhase('intro');
    } else {
      const grade = calculateGrade(answersRef.current);
      const diffMap = { 1: 'easy', 2: 'normal', 3: 'hard' };
      const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...user,
        grade,
        difficulty: diffMap[grade],
        todayScores: { memory: 0, attention: 0, language: 0, spatial: 0, executive: 0, calculation: 0 },
      }));
      navigate('/admission-result');
    }
  }

  function showFeedbackThenSubmit(isCorrect, responseTime, selectedChoice, correctAnswer) {
    feedbackRef.current = true;
    setFeedback({ isCorrect, selectedChoice, correctAnswer });
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      submitAnswer(isCorrect, responseTime);
    }, 1500);
  }

  function handleAnswer(choice) {
    if (subPhaseRef.current !== 'answering') return;
    if (feedbackRef.current) return;
    clearTimer();
    const responseTime = Date.now() - questionStartRef.current;
    const isCorrect    = checkAnswer(currentQRef.current, choice, examDataRef.current);
    const correctAnswer = getCorrectAnswer(currentQRef.current, examDataRef.current);
    showFeedbackThenSubmit(isCorrect, responseTime, choice, correctAnswer);
  }

  function handleQ4Tap(idx) {
    if (subPhaseRef.current !== 'answering') return;
    if (feedbackRef.current) return;
    const cur = q4SelectedRef.current;
    let next;
    if (cur.includes(idx)) {
      next = cur.filter(i => i !== idx);
    } else if (cur.length < 3) {
      next = [...cur, idx];
    } else {
      return;
    }
    q4SelectedRef.current = next;
    setQ4Selected([...next]);

    if (next.length === 3) {
      clearTimer();
      const responseTime  = Date.now() - questionStartRef.current;
      const isCorrect     = checkAnswer(3, next, examDataRef.current);
      const correctAnswer = examDataRef.current.q4.target;
      showFeedbackThenSubmit(isCorrect, responseTime, next, correctAnswer);
    }
  }

  // 페이즈 전환 (intro → showing/answering, showing → answering)
  useEffect(() => {
    let t;
    if (subPhase === 'intro') {
      t = setTimeout(() => {
        const meta = Q_META[currentQRef.current];
        if (meta.hasShowing) {
          subPhaseRef.current = 'showing';
          setSubPhase('showing');
        } else {
          startAnsweringPhase();
        }
      }, 2000);
    } else if (subPhase === 'showing') {
      t = setTimeout(() => startAnsweringPhase(), 2000);
    }
    return () => clearTimeout(t);
  }, [subPhase, currentQ]); // eslint-disable-line

  useEffect(() => () => { clearTimer(); clearFeedbackTimer(); }, []);

  // ─── 렌더링 ────────────────────────────────────────────────────────────────

  const meta        = Q_META[currentQ];
  const isIntro     = subPhase === 'intro';
  const isShowing   = subPhase === 'showing';
  const isAnswering = subPhase === 'answering';

  const { q1, q2, q3, q4, q5, q6 } = examData;

  // 선택지 버튼 스타일 (피드백 반영)
  function getChoiceBtnStyle(value) {
    if (!feedback) return styles.choiceBtn;
    if (value === feedback.selectedChoice) {
      return feedback.isCorrect
        ? { ...styles.choiceBtn, background: '#E8F5E9', border: '2px solid #43A047', color: '#2E7D32' }
        : { ...styles.choiceBtn, background: '#FFEBEE', border: '2px solid #E53935', color: '#B71C1C' };
    }
    if (value === feedback.correctAnswer && !feedback.isCorrect) {
      return { ...styles.choiceBtn, background: '#E8F5E9', border: '2px solid #43A047', color: '#2E7D32' };
    }
    return { ...styles.choiceBtn, opacity: 0.45 };
  }

  // Q4 격자 셀 스타일 (피드백 반영)
  function getQ4CellStyle(idx) {
    if (isShowing) {
      return q4.target.includes(idx)
        ? { ...styles.spatialCell, ...styles.spatialCellTarget }
        : styles.spatialCell;
    }
    if (feedback) {
      const inTarget   = feedback.correctAnswer.includes(idx);
      const inSelected = feedback.selectedChoice.includes(idx);
      if (inTarget && inSelected)  return { ...styles.spatialCell, background: '#43A047', border: '2px solid #43A047', boxShadow: '0 4px 16px rgba(67,160,71,0.4)' };
      if (inSelected && !inTarget) return { ...styles.spatialCell, background: '#E53935', border: '2px solid #E53935', boxShadow: '0 4px 16px rgba(229,57,53,0.4)' };
      if (inTarget && !inSelected) return { ...styles.spatialCell, background: '#FB8C00', border: '2px solid #FB8C00', boxShadow: '0 4px 16px rgba(251,140,0,0.4)' };
      return styles.spatialCell;
    }
    return q4Selected.includes(idx)
      ? { ...styles.spatialCell, ...styles.spatialCellSelected }
      : styles.spatialCell;
  }

  function renderQuestionContent() {
    switch (currentQ) {
      case 0: // 기억력
        return isShowing ? (
          <div style={styles.numberGrid}>
            {q1.shown.map(n => (
              <div key={n} style={styles.numberCard}>{n}</div>
            ))}
          </div>
        ) : (
          <div style={styles.choiceGrid}>
            {q1.choices.map((n, i) => (
              <button
                key={i}
                style={getChoiceBtnStyle(n)}
                onClick={() => handleAnswer(n)}
                disabled={!!feedback}
              >
                {n}
              </button>
            ))}
          </div>
        );

      case 1: // 주의집중력 (스트룹)
        return (
          <>
            <div style={styles.stroopBox}>
              <span style={{ ...styles.stroopWord, color: q2.ink }}>{q2.word}</span>
            </div>
            <div style={styles.choiceGrid}>
              {q2.choices.map((name, i) => (
                <button
                  key={i}
                  style={getChoiceBtnStyle(name)}
                  onClick={() => handleAnswer(name)}
                  disabled={!!feedback}
                >
                  {name}
                </button>
              ))}
            </div>
          </>
        );

      case 2: // 언어능력 (초성)
        return (
          <>
            <div style={styles.chosungBox}>
              <span style={styles.chosungText}>{q3.chosung}</span>
              <span style={styles.chosungHint}>{q3.hint}</span>
            </div>
            <div style={styles.choiceGrid}>
              {q3.choices.map((word, i) => (
                <button
                  key={i}
                  style={getChoiceBtnStyle(word)}
                  onClick={() => handleAnswer(word)}
                  disabled={!!feedback}
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        );

      case 3: // 시공간능력 (격자)
        return (
          <>
            <div style={styles.spatialGrid}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
                <div
                  key={idx}
                  onClick={() => !isShowing && handleQ4Tap(idx)}
                  style={{
                    ...getQ4CellStyle(idx),
                    cursor: (isShowing || !!feedback) ? 'default' : 'pointer',
                  }}
                />
              ))}
            </div>
            {!isShowing && (
              <p style={styles.spatialCount}>{q4Selected.length} / 3 칸 선택됨</p>
            )}
          </>
        );

      case 4: // 전두엽 집행능력
        return (
          <>
            <div style={styles.ruleBox}>
              <span style={styles.ruleText}>{q5.rule}</span>
            </div>
            <div style={styles.choiceGrid}>
              {q5.choices.map((item, i) => (
                <button
                  key={i}
                  style={getChoiceBtnStyle(item.name)}
                  onClick={() => handleAnswer(item.name)}
                  disabled={!!feedback}
                >
                  <span style={styles.choiceBtnEmoji}>{item.emoji}</span>
                  <span style={styles.choiceBtnLabel}>{item.name}</span>
                </button>
              ))}
            </div>
          </>
        );

      case 5: // 계산능력 (총액 계산)
        return (
          <>
            <div style={styles.calcCard}>
              {q6.items.map(item => (
                <div key={item.name} style={styles.calcRow}>
                  <span style={styles.calcName}>{item.name}</span>
                  <span style={styles.calcPrice}>{item.price.toLocaleString('ko-KR')}원</span>
                </div>
              ))}
              <div style={styles.calcDivider} />
              <div style={styles.calcTotalRow}>
                <span style={styles.calcTotalLabel}>합계는?</span>
                <span style={styles.calcTotalValue}>?</span>
              </div>
            </div>
            <div style={styles.choiceGrid}>
              {q6.choices.map((amt, i) => (
                <button
                  key={i}
                  style={getChoiceBtnStyle(amt)}
                  onClick={() => handleAnswer(amt)}
                  disabled={!!feedback}
                >
                  {amt.toLocaleString('ko-KR')}원
                </button>
              ))}
            </div>
          </>
        );

      default: return null;
    }
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <p style={styles.headerTitle}>신입생 선발 고사</p>
        <div style={styles.progressRow}>
          {Q_META.map((_, i) => (
            <div key={i} style={{
              ...styles.progressStep,
              ...(i < currentQ   ? styles.progressStepDone    : {}),
              ...(i === currentQ ? styles.progressStepCurrent : {}),
            }}>
              <span style={styles.progressStepNum}>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 힌트 바 + 타이머 (answering 단계) */}
      {isAnswering && (
        <div style={{ ...styles.hintBar, ...(timeLeft <= 3 ? styles.hintBarUrgent : {}) }}>
          <span style={styles.hintText}>{meta.hint}</span>
          <div style={{ ...styles.timerBadge, ...(timeLeft <= 3 ? styles.timerBadgeUrgent : {}) }}>
            <span style={styles.timerNum}>{timeLeft}</span>
            <span style={styles.timerUnit}>초</span>
          </div>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div style={styles.content}>
        {isIntro ? (
          <div style={styles.introBox}>
            <div style={styles.introEmoji}>{meta.emoji}</div>
            <div style={styles.introCategory}>{meta.label}</div>
            <div style={styles.introText}>{meta.intro}</div>
            <div style={styles.introSub}>잠시 후 시작됩니다...</div>
          </div>
        ) : (
          <div style={{ ...styles.questionWrap, position: 'relative' }}>
            {/* 정답 배지 */}
            {feedback?.isCorrect && (
              <div style={styles.correctBadge}>정답!</div>
            )}
            {isShowing && (
              <div style={styles.showingLabel}>기억하세요!</div>
            )}
            {renderQuestionContent()}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

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
    padding: '28px 24px 24px',
    borderRadius: '0 0 28px 28px',
    marginBottom: '8px',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '16px',
  },
  progressRow: { display: 'flex', gap: '8px' },
  progressStep: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepDone:    { background: 'rgba(255,255,255,0.5)' },
  progressStepCurrent: { background: '#FFFFFF' },
  progressStepNum: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1F3EE0',
  },
  hintBar: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#FFFFFF',
    borderRadius: '14px',
    padding: '14px 18px',
    margin: '12px 20px 0',
    boxShadow: '0 2px 8px rgba(31,62,224,0.10)',
    boxSizing: 'border-box',
    border: '2px solid transparent',
  },
  hintBarUrgent: {
    border: '2px solid #FF4D4D',
    background: '#FFF5F5',
  },
  hintText: { fontSize: '18px', fontWeight: '700', color: '#12153D' },
  timerBadge: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '3px',
    background: '#EEF1FE',
    padding: '6px 14px',
    borderRadius: '10px',
  },
  timerBadgeUrgent: { background: '#FFE5E5' },
  timerNum:  { fontSize: '24px', fontWeight: '900', color: '#1F3EE0' },
  timerUnit: { fontSize: '16px', fontWeight: '700', color: '#6876A0' },
  content: {
    width: '100%',
    maxWidth: '520px',
    padding: '16px 20px 48px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  // 인트로
  introBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '40px 0',
  },
  introEmoji: { fontSize: '72px' },
  introCategory: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#6876A0',
    background: '#EEF1FE',
    padding: '6px 20px',
    borderRadius: '20px',
  },
  introText: { fontSize: '28px', fontWeight: '800', color: '#12153D', textAlign: 'center' },
  introSub:  { fontSize: '18px', color: '#A0A8C0', fontWeight: '600' },

  // 문제 공통
  questionWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
  },
  showingLabel: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1F3EE0',
    background: '#EEF1FE',
    padding: '8px 24px',
    borderRadius: '12px',
    alignSelf: 'center',
  },

  // 정답 배지
  correctBadge: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    background: '#43A047',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 10,
  },

  // 선택지
  choiceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
  },
  choiceBtn: {
    padding: '22px 12px',
    background: '#FFFFFF',
    border: '2px solid #E0E5F0',
    borderRadius: '16px',
    fontSize: '22px',
    fontWeight: '800',
    color: '#12153D',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'background 0.15s, border-color 0.15s',
  },
  choiceBtnEmoji: { fontSize: '36px' },
  choiceBtnLabel: { fontSize: '20px', fontWeight: '800', color: '#12153D' },

  // Q1: 기억력
  numberGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    width: '100%',
  },
  numberCard: {
    background: '#1F3EE0',
    color: '#FFFFFF',
    fontSize: '56px',
    fontWeight: '900',
    height: '110px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(31,62,224,0.3)',
  },

  // Q2: 스트룹
  stroopBox: {
    width: '100%',
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '36px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  stroopWord: { fontSize: '72px', fontWeight: '900', letterSpacing: '4px' },

  // Q3: 초성
  chosungBox: {
    width: '100%',
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  chosungText: { fontSize: '56px', fontWeight: '900', color: '#1F3EE0', letterSpacing: '16px' },
  chosungHint: { fontSize: '52px' },

  // Q4: 시공간
  spatialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    width: '280px',
  },
  spatialCell: {
    width: '80px',
    height: '80px',
    background: '#FFFFFF',
    borderRadius: '14px',
    border: '2px solid #E0E5F0',
    transition: 'background 0.15s',
  },
  spatialCellTarget: {
    background: '#1F3EE0',
    border: '2px solid #1F3EE0',
    boxShadow: '0 4px 16px rgba(31,62,224,0.4)',
  },
  spatialCellSelected: {
    background: '#43A047',
    border: '2px solid #43A047',
    boxShadow: '0 4px 16px rgba(67,160,71,0.4)',
  },
  spatialCount: { fontSize: '20px', fontWeight: '700', color: '#6876A0', textAlign: 'center' },

  // Q5: 집행능력
  ruleBox: {
    width: '100%',
    background: '#FFF8E1',
    border: '2px solid #FFB300',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
  },
  ruleText: { fontSize: '24px', fontWeight: '900', color: '#5A3000' },

  // Q6: 계산 (총액)
  calcCard: {
    width: '100%',
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '20px 24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    border: '2px solid #FFB300',
  },
  calcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px dotted #E0E5F0',
  },
  calcName:  { fontSize: '22px', fontWeight: '600', color: '#12153D' },
  calcPrice: { fontSize: '22px', fontWeight: '700', color: '#12153D' },
  calcDivider: { height: '2px', background: '#12153D', margin: '8px 0 4px' },
  calcTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0 0',
    marginTop: '4px',
  },
  calcTotalLabel: { fontSize: '22px', fontWeight: '800', color: '#1F3EE0' },
  calcTotalValue: { fontSize: '28px', fontWeight: '900', color: '#1F3EE0' },
};
