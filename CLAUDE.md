# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트 검사
npm run lint
```

## 프로젝트 개요

- **대상**: 50대~70대 시니어
- **목적**: 치매 예방 기억력 카드 뒤집기 게임 웹앱

## 디자인 원칙

- 글씨 크기 최소 18px 이상
- 버튼 크게, 터치하기 쉽게
- 색상 대비 강하게
- 텍스트 전체 한글
- 불필요한 애니메이션 최소화

## Architecture

React 19 + Vite 8 기반의 싱글 페이지 애플리케이션.

### 폴더 구조

```
src/
├── main.jsx              # 앱 진입점
├── App.jsx               # 라우터 설정
├── pages/
│   └── Home.jsx          # 홈 화면 (게임 목록 선택)
├── games/                # 게임별 독립 폴더
│   └── memory-card/      # 기억력 카드 뒤집기
│       ├── index.jsx     # 게임 진입점
│       ├── components/   # 게임 전용 컴포넌트
│       └── hooks/        # 게임 전용 훅
├── components/           # 공통 컴포넌트
└── assets/               # 정적 에셋
```

### 게임 확장 방식

새 게임 추가 시:
1. `src/games/<game-name>/` 폴더 생성 후 `index.jsx` 작성
2. `src/App.jsx`에 라우트 추가
3. `src/pages/Home.jsx`의 게임 목록 배열에 항목 추가

빌드 도구는 Vite(rolldown 기반), 번들러 설정은 `vite.config.js`에서 관리. ESLint 설정은 `eslint.config.js`(flat config 방식).
