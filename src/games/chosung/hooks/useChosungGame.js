import { useState, useEffect, useRef, useCallback } from 'react';

const CHOSUNG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getChosung(word) {
  return word.split('').map(char => {
    const code = char.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return char;
    return CHOSUNG_LIST[Math.floor(code / 28 / 21)];
  }).join(' ');
}

const ALL_WORDS = [
  // 2글자 - 자연
  { word: '하늘', category: '자연' },
  { word: '바람', category: '자연' },
  { word: '강물', category: '자연' },
  { word: '봄비', category: '자연' },
  { word: '단풍', category: '자연' },
  { word: '새벽', category: '자연' },
  { word: '파도', category: '자연' },
  { word: '초원', category: '자연' },
  { word: '안개', category: '자연' },
  { word: '노을', category: '자연' },
  // 2글자 - 동물/곤충
  { word: '나비', category: '동물/곤충' },
  { word: '사슴', category: '동물/곤충' },
  { word: '토끼', category: '동물/곤충' },
  { word: '고래', category: '동물/곤충' },
  { word: '오리', category: '동물/곤충' },
  { word: '거북', category: '동물/곤충' },
  { word: '매미', category: '동물/곤충' },
  { word: '개미', category: '동물/곤충' },
  { word: '여우', category: '동물/곤충' },
  { word: '참새', category: '동물/곤충' },
  // 2글자 - 음식
  { word: '김치', category: '음식' },
  { word: '된장', category: '음식' },
  { word: '국밥', category: '음식' },
  { word: '냉면', category: '음식' },
  { word: '만두', category: '음식' },
  { word: '떡국', category: '음식' },
  { word: '잡채', category: '음식' },
  { word: '순대', category: '음식' },
  { word: '갈비', category: '음식' },
  { word: '보쌈', category: '음식' },
  // 2글자 - 감정
  { word: '사랑', category: '감정' },
  { word: '행복', category: '감정' },
  { word: '기쁨', category: '감정' },
  { word: '설렘', category: '감정' },
  { word: '슬픔', category: '감정' },
  { word: '분노', category: '감정' },
  { word: '평화', category: '감정' },
  { word: '희망', category: '감정' },
  { word: '용기', category: '감정' },
  { word: '믿음', category: '감정' },
  // 2글자 - 가족
  { word: '부모', category: '가족' },
  { word: '형제', category: '가족' },
  { word: '부부', category: '가족' },
  { word: '아들', category: '가족' },
  { word: '손자', category: '가족' },
  { word: '조카', category: '가족' },
  { word: '남편', category: '가족' },
  { word: '아내', category: '가족' },
  { word: '언니', category: '가족' },
  { word: '오빠', category: '가족' },
  // 2글자 - 장소
  { word: '고향', category: '장소' },
  { word: '학교', category: '장소' },
  { word: '시장', category: '장소' },
  { word: '마당', category: '장소' },
  { word: '정원', category: '장소' },
  { word: '바다', category: '장소' },
  { word: '들판', category: '장소' },
  { word: '도시', category: '장소' },
  { word: '산길', category: '장소' },
  { word: '강가', category: '장소' },
  // 3글자 - 자연
  { word: '무지개', category: '자연' },
  { word: '소나기', category: '자연' },
  { word: '단풍잎', category: '자연' },
  { word: '봄바람', category: '자연' },
  { word: '구름떼', category: '자연' },
  { word: '석양빛', category: '자연' },
  { word: '은하수', category: '자연' },
  { word: '새벽빛', category: '자연' },
  { word: '맑은날', category: '자연' },
  { word: '푸른빛', category: '자연' },
  // 3글자 - 동물/곤충
  { word: '고양이', category: '동물/곤충' },
  { word: '강아지', category: '동물/곤충' },
  { word: '두루미', category: '동물/곤충' },
  { word: '앵무새', category: '동물/곤충' },
  { word: '원숭이', category: '동물/곤충' },
  { word: '거북이', category: '동물/곤충' },
  { word: '호랑이', category: '동물/곤충' },
  { word: '코끼리', category: '동물/곤충' },
  { word: '메뚜기', category: '동물/곤충' },
  { word: '비둘기', category: '동물/곤충' },
  // 3글자 - 음식
  { word: '비빔밥', category: '음식' },
  { word: '삼겹살', category: '음식' },
  { word: '불고기', category: '음식' },
  { word: '된장국', category: '음식' },
  { word: '갈비탕', category: '음식' },
  { word: '떡볶이', category: '음식' },
  { word: '순두부', category: '음식' },
  { word: '감자탕', category: '음식' },
  { word: '삼계탕', category: '음식' },
  { word: '팥빙수', category: '음식' },
  // 3글자 - 감정
  { word: '그리움', category: '감정' },
  { word: '설레임', category: '감정' },
  { word: '행복감', category: '감정' },
  { word: '즐거움', category: '감정' },
  { word: '외로움', category: '감정' },
  { word: '두려움', category: '감정' },
  { word: '황홀함', category: '감정' },
  { word: '흥분감', category: '감정' },
  { word: '뿌듯함', category: '감정' },
  { word: '안도감', category: '감정' },
  // 3글자 - 가족
  { word: '어머니', category: '가족' },
  { word: '아버지', category: '가족' },
  { word: '할머니', category: '가족' },
  { word: '남동생', category: '가족' },
  { word: '여동생', category: '가족' },
  { word: '이모님', category: '가족' },
  { word: '큰아들', category: '가족' },
  { word: '작은딸', category: '가족' },
  { word: '사촌형', category: '가족' },
  { word: '올케님', category: '가족' },
  // 3글자 - 장소
  { word: '놀이터', category: '장소' },
  { word: '도서관', category: '장소' },
  { word: '수영장', category: '장소' },
  { word: '동물원', category: '장소' },
  { word: '꽃시장', category: '장소' },
  { word: '우체국', category: '장소' },
  { word: '경찰서', category: '장소' },
  { word: '미용실', category: '장소' },
  { word: '편의점', category: '장소' },
  { word: '운동장', category: '장소' },
  // 4글자 - 자연
  { word: '해바라기', category: '자연' },
  { word: '가을단풍', category: '자연' },
  { word: '산들바람', category: '자연' },
  { word: '봄날아침', category: '자연' },
  { word: '무지개빛', category: '자연' },
  { word: '새벽이슬', category: '자연' },
  { word: '하얀구름', category: '자연' },
  { word: '푸른바다', category: '자연' },
  { word: '황금들판', category: '자연' },
  { word: '봄꽃향기', category: '자연' },
  // 4글자 - 동물/곤충
  { word: '새끼사슴', category: '동물/곤충' },
  { word: '아기고래', category: '동물/곤충' },
  { word: '흰두루미', category: '동물/곤충' },
  { word: '작은거북', category: '동물/곤충' },
  { word: '날쌘여우', category: '동물/곤충' },
  { word: '줄무늬말', category: '동물/곤충' },
  { word: '흰코끼리', category: '동물/곤충' },
  { word: '아기펭귄', category: '동물/곤충' },
  { word: '큰부리새', category: '동물/곤충' },
  { word: '점박이곰', category: '동물/곤충' },
  // 4글자 - 음식
  { word: '된장찌개', category: '음식' },
  { word: '두부김치', category: '음식' },
  { word: '비빔냉면', category: '음식' },
  { word: '부대찌개', category: '음식' },
  { word: '닭볶음탕', category: '음식' },
  { word: '참치김밥', category: '음식' },
  { word: '소갈비탕', category: '음식' },
  { word: '돼지국밥', category: '음식' },
  { word: '순대국밥', category: '음식' },
  { word: '해물파전', category: '음식' },
  // 4글자 - 감정
  { word: '기쁜마음', category: '감정' },
  { word: '설레는봄', category: '감정' },
  { word: '그리운님', category: '감정' },
  { word: '즐거운날', category: '감정' },
  { word: '행복가득', category: '감정' },
  { word: '슬픈마음', category: '감정' },
  { word: '따뜻한정', category: '감정' },
  { word: '감사한맘', category: '감정' },
  { word: '두근두근', category: '감정' },
  { word: '뿌듯한날', category: '감정' },
  // 4글자 - 가족
  { word: '할아버지', category: '가족' },
  { word: '외할머니', category: '가족' },
  { word: '큰아버지', category: '가족' },
  { word: '사촌동생', category: '가족' },
  { word: '막내아들', category: '가족' },
  { word: '이모부님', category: '가족' },
  { word: '고모부님', category: '가족' },
  { word: '큰딸아이', category: '가족' },
  { word: '삼촌부부', category: '가족' },
  { word: '남편부모', category: '가족' },
  // 4글자 - 장소
  { word: '놀이공원', category: '장소' },
  { word: '어린이집', category: '장소' },
  { word: '시골마을', category: '장소' },
  { word: '도시공원', category: '장소' },
  { word: '강변산책', category: '장소' },
  { word: '바닷가길', category: '장소' },
  { word: '오래된집', category: '장소' },
  { word: '산골마을', category: '장소' },
  { word: '백화점길', category: '장소' },
  { word: '기차역앞', category: '장소' },
];

export const DIFFICULTY_CONFIG = {
  easy:   { label: '초급', wordLength: 2, detail: '2글자 단어 · 10문제 · 60초' },
  normal: { label: '중급', wordLength: 3, detail: '3글자 단어 · 10문제 · 60초' },
  hard:   { label: '고급', wordLength: 4, detail: '4글자 단어(힌트 없음) · 10문제 · 60초' },
};

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 60;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(wordLength) {
  const pool = ALL_WORDS.filter(w => w.word.length === wordLength);
  const selected = shuffle(pool).slice(0, TOTAL_QUESTIONS);

  return selected.map(item => {
    const wrong = shuffle(pool.filter(w => w.word !== item.word)).slice(0, 3);
    const choices = shuffle([item, ...wrong]).map(c => c.word);
    return {
      word: item.word,
      category: item.category,
      chosung: getChosung(item.word),
      hint: `${item.category}에 관련된 단어예요`,
      choices,
    };
  });
}

export function useChosungGame(difficulty) {
  const cfg = DIFFICULTY_CONFIG[difficulty];

  const [questions] = useState(() => generateQuestions(cfg.wordLength));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [status, setStatus] = useState('playing'); // 'playing' | 'timeout' | 'done'
  const [feedback, setFeedback] = useState(null); // { selected, correct, isCorrect }
  const answeredRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (status !== 'playing') return;
    if (timeLeft <= 0) {
      setStatus('timeout');
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, status]);

  const handleAnswer = useCallback((selected) => {
    if (status !== 'playing' || answeredRef.current || feedback) return;
    answeredRef.current = true;

    const correct = questions[currentIndex].word;
    const isCorrect = selected === correct;
    if (isCorrect) setCorrectCount(c => c + 1);
    setFeedback({ selected, correct, isCorrect });

    setTimeout(() => {
      setFeedback(null);
      answeredRef.current = false;
      if (currentIndex + 1 >= TOTAL_QUESTIONS) {
        setStatus('done');
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, isCorrect ? 700 : 1000);
  }, [status, feedback, questions, currentIndex]);

  const calculateScore = useCallback(() => {
    const elapsed = Math.min((Date.now() - startTimeRef.current) / 1000, TIME_LIMIT);
    const answered = currentIndex + (status === 'playing' ? 0 : 1);
    const accuracyRaw = answered > 0 ? correctCount / answered : 0;
    const accuracy = Math.round(accuracyRaw * 60);
    const speedRatio = status === 'timeout'
      ? correctCount / TOTAL_QUESTIONS
      : Math.max(0, (TIME_LIMIT - elapsed) / TIME_LIMIT);
    const speed = Math.max(8, Math.round(speedRatio * 25));
    const efficiency = Math.max(5, Math.round((correctCount / TOTAL_QUESTIONS) * 15));
    const total = Math.min(100, accuracy + speed + efficiency);
    return { total, accuracy, speed, efficiency, correctCount, totalQuestions: TOTAL_QUESTIONS };
  }, [correctCount, currentIndex, status]);

  return {
    cfg,
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex],
    correctCount,
    timeLeft,
    status,
    feedback,
    totalQuestions: TOTAL_QUESTIONS,
    handleAnswer,
    calculateScore,
  };
}
