# YUNN — 매일 피부를 관리해주는 AI 서비스

Personal Skincare Routine Companion  
설문을 통한 맞춤 피부 타입 진단과 일일 케어 루틴 추적, 결과 비교를 제공하는 모바일 웹 애플리케이션

---

## Why YUNN?

대부분의 스킨케어 서비스는 피부 타입을 알려주는 것에서 끝납니다.

YUNN은 결과를 보여주는 서비스를 넘어, 사용자가 매일 자신의 피부를 올바르게 관리할 수 있도록 돕는 AI 스킨케어 컴패니언을 지향합니다.
맞춤형 루틴, 꾸준한 기록, 변화 추적을 통해 건강한 스킨케어 습관을 만들어 갑니다.

Most skincare apps stop after giving
a skin type result.

YUNN focuses on helping users
actually build skincare habits through
daily routines, reminders,
and progress tracking.

---

## 📌 프로젝트 소개

YUNN은 사용자가 설문을 통해 자신의 피부 타입을 진단하고, 이에 맞는 스킨케어 루틴을 매일 추적하며, Before/After 사진으로 변화를 비교할 수 있는 앱입니다.

**현재 상태**
- ✅ 프론트엔드 개발 완료
- ⏳ 백엔드 개발 진행 중

---

## 🎯 주요 기능

### 1. 홈 (Home)
- 상품 카테고리 및 추천 상품 전시
- 장바구니 기능

### 2. 설문 (Survey)
- 10단계 다단계 설문
  - 성별, 연령대, 피부 상태 이미지, 피부 특성 선택
  - 마지막 단계: 피부 사진 업로드
- 진행률 저장 (localStorage)
- Google Tag Manager를 통한 사용자 행동 추적

### 3. 루틴 (Routine)
- 일일 스킨케어 루틴 체크리스트
- 연속 달성 일수(Streak) 표시
- Before/After 사진 비교 기능
- 일일 진행도 시각화

---

## 💻 개발 환경

| 항목 | 버전/정보 |
|------|---------|
| Node.js | 18 이상 |
| 패키지 매니저 | npm 또는 yarn |
| 프로젝트 구조 | Monorepo (apps/yunn-frontend, apps/yunn-backend) |

---

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js** 16.2.9 — React 풀스택 프레임워크
- **React** 19.2.4 — UI 라이브러리
- **TypeScript** ^5 — 정적 타입 언어
- **Tailwind CSS** ^4 — 유틸리티 기반 스타일링
- **Zod** ^4.4.3 — 런타임 스키마 검증
- **Vitest** ^4.1.10 — 유닛 테스트
- **ESLint** ^9 — 코드 린팅
- **Prettier** ^3.9.4 — 코드 포맷팅

### 백엔드

Backend

Express

Prisma

PostgreSQL

JWT

Zod

REST API

---

## 📁 프로젝트 아키텍처

```
YUNN_App/
├── apps/
│   ├── yunn-frontend/                 # Next.js 프론트엔드
│   │   ├── app/
│   │   │   ├── page.tsx               # 홈 페이지 (장바구니, 사이드바 상태 관리)
│   │   │   ├── home/                  # 홈 화면 컴포넌트
│   │   │   │   ├── HomeHeader.tsx     # 헤더 (카트, 메뉴 버튼)
│   │   │   │   ├── HeroCard.tsx       # 배너
│   │   │   │   ├── CategorySection.tsx # 카테고리 섹션
│   │   │   │   ├── TopSellingSection.tsx # 상품 섹션
│   │   │   │   ├── CartSheet.tsx      # 장바구니 드로어
│   │   │   │   ├── HomeSidebar.tsx    # 사이드바
│   │   │   │   ├── HomeBottomNav.tsx  # 하단 네비게이션
│   │   │   │   └── home-data.ts       # 상품 데이터
│   │   │   │
│   │   │   ├── survey/                # 설문 페이지
│   │   │   │   ├── page.tsx           # 설문 오케스트레이터
│   │   │   │   ├── screens/           # 화면별 컴포넌트
│   │   │   │   ├── components/        # 설문 입력 컴포넌트
│   │   │   │   ├── step-data.ts       # 설문 데이터 (옵션, 질문)
│   │   │   │   ├── survey-progress.ts # 진행률 저장/불러오기
│   │   │   │   ├── survey-analytics.ts # 분석 이벤트
│   │   │   │   └── result-data.ts     # 진단 결과 규칙
│   │   │   │
│   │   │   ├── routine/               # 루틴 페이지
│   │   │   │   ├── page.tsx           # 루틴 오케스트레이터
│   │   │   │   ├── screens/           # 화면별 컴포넌트
│   │   │   │   ├── lib/use-routine.ts # 루틴 상태 관리 훅
│   │   │   │   └── components/        # 루틴 컴포넌트
│   │   │   │
│   │   │   └── lib/                   # 공용 유틸리티
│   │   │       ├── analytics.ts       # Google Tag Manager 이벤트
│   │   │       ├── sheet-repository.ts # Google Sheets API (설문 저장)
│   │   │       └── config.ts          # 설정값
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tailwind.config.js
│   │
│   └── yunn-backend/                  # 백엔드 (개발 중)
│
└── README.md                           # 이 파일
```

**설계 원칙**
- 페이지별 오케스트레이터 패턴: 각 페이지는 상태 관리만 담당, 개별 UI는 컴포넌트에 캡슐화
- localStorage 기반 영속성: 사용자 진행 상태를 로컬에 저장
- 타입 안전성: TypeScript + Zod로 런타임 검증
- 분석 중심: Google Tag Manager를 통한 상세 이벤트 추적

---

## 📦 설치 방법

### 1단계: 저장소 클론

```bash
git clone <repository-url>
cd YUNN_App
```

### 2단계: 프론트엔드 의존성 설치

```bash
cd apps/yunn-frontend
npm install
```

또는 yarn 사용:

```bash
yarn install
```

### 3단계: 확인

설치가 완료되면 프로젝트 구조 확인:

```bash
ls -la
```

---

## 🚀 사용 방법

### 개발 서버 실행

```bash
cd apps/yunn-frontend
npm run dev
```

브라우저에서 열기: **http://localhost:3000**

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 코드 검사 및 포맷팅

```bash
# ESLint로 코드 검사
npm run lint

# Prettier로 자동 포맷팅
npm run format
```

### 테스트 실행

```bash
npm test
```

---

## 📚 주요 파일 설명

| 파일/폴더 | 설명 |
|---------|------|
| `app/page.tsx` | 홈 페이지 (상품 전시, 장바구니) |
| `app/survey/page.tsx` | 설문 페이지 (10단계 설문 오케스트레이터) |
| `app/routine/page.tsx` | 루틴 페이지 (일일 체크리스트) |
| `app/lib/analytics.ts` | Google Tag Manager 이벤트 함수 |
| `app/survey/survey-progress.ts` | 설문 진행률 저장/복원 로직 |
| `app/routine/lib/use-routine.ts` | 루틴 상태 관리 및 날짜 계산 |

---

## 🔍 참고 및 출처

### 공식 문서
- [Next.js 공식 문서](https://nextjs.org/docs) — 프레임워크 API 및 기능
- [React 공식 문서](https://react.dev) — React 훅 및 컴포넌트 패턴
- [Tailwind CSS 문서](https://tailwindcss.com) — 유틸리티 클래스 및 설정
- [TypeScript 문서](https://www.typescriptlang.org/docs) — 타입 정의 및 고급 기능
- [Zod 문서](https://zod.dev) — 스키마 검증 및 타입 추론

### 주의사항
- Next.js 16은 최신 버전으로 API 변경이 있을 수 있습니다. `node_modules/next/dist/docs/`에서 최신 정보를 확인하세요.
- localStorage 데이터 구조 변경 시 마이그레이션 로직을 추가해야 합니다.
- Google Tag Manager 이벤트 추적은 개발자 도구의 `dataLayer`에서 확인 가능합니다.

---

## 📝 개발 규칙 (CLAUDE.md 참고)

- 모든 문서는 한글로 작성
- 컴포넌트는 명확한 Props 인터페이스 정의 필수
- 주석은 핵심만 한 문장으로 간결하게
- 테스트는 유틸리티 함수와 복잡한 컴포넌트에 우선 적용
- TypeScript 타입 검사: `npm run build`로 확인

---

**Version**: 0.1.0  
**Last Updated**: 2026-07-14  
**Status**: 프론트엔드 완료, 백엔드 개발 중
