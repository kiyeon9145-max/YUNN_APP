# YUNN 백엔드 - 미션7 실행 계획

**프로젝트 기간**: 2026-07-14 ~ (TBD)  
**목표**: Google Sheets 기반 비콘 방식에서 REST API 기반 서버로 전환  
**스코프**: 설문 저장 + 루틴 트래킹의 4개 API

---

## 프로젝트 개요

### 현재 상태 (문제점)
- ❌ 설문 데이터: Google Apps Script 웹앱에 일방향 비콘으로 전송 (응답 없음, 조회 불가)
- ❌ 루틴 추적: 100% localStorage (기기 변경하면 데이터 손실)
- ❌ 설문 결과 계산: 클라이언트 전용 (서버 검증 없음)
- ❌ 인증: 없음 (yunn_session_id만 사용)
- ❌ DB: 없음

### 목표 상태 (미션7 후)
- ✅ 설문: POST /surveys로 저장, GET /surveys/:sessionId로 조회
- ✅ 루틴: GET /routine/:sessionId 조회, PATCH /routine/:sessionId 저장
- ✅ 서버 검증: zod 스키마로 입력값 검증
- ✅ DB: PostgreSQL (Supabase 또는 DBeaver 직접 연결)
- ✅ 에러 처리: 통일된 응답 포맷 (success/error)

---

## 아키텍처 설계

### 기술 스택
| 항목 | 선택 | 이유 |
|------|------|------|
| 런타임 | Node.js + TypeScript | 프론트와 동일 언어 |
| 프레임워크 | Express.js | 경량, 심플, 가장 널리 쓰임 |
| DB | PostgreSQL | 프로덕션급, 관계형 |
| ORM | Prisma | 타입 안전, 마이그레이션 자동화 |
| 검증 | zod | 런타임 검증 + 타입 추론 |
| 테스트 | vitest + supertest | 프론트와 동일, REST API 테스트 용이 |
| 배포 | Render 또는 Railway | Node 호스팅, 무료 티어 |

### 폴더 구조 (헥사고날 아키텍처)
```
src/
├── inbound/           # HTTP 진입점
│   ├── http/
│   │   ├── routes/
│   │   │   ├── surveys.ts      # POST/GET /surveys
│   │   │   └── routine.ts      # GET/PATCH /routine
│   │   └── middleware/
│   │       └── errorHandler.ts # 통일된 에러 처리
│   └── index.ts       # Express 앱 인스턴스
├── application/       # 비즈니스 로직
│   ├── surveys/
│   │   ├── submitSurvey.ts     # 설문 저장 로직
│   │   └── getSurvey.ts        # 설문 조회 로직
│   └── routine/
│       ├── getRoutine.ts       # 루틴 조회 로직
│       └── updateRoutine.ts    # 루틴 업데이트 로직
├── outbound/          # 외부 의존성 (DB)
│   └── persistence/
│       ├── surveyRepository.ts
│       └── routineRepository.ts
├── shared/            # 공유 유틸
│   ├── schemas/       # zod 스키마
│   │   ├── surveys.ts
│   │   └── routine.ts
│   ├── types/         # 타입 정의
│   └── errors/        # 에러 클래스
├── app.ts            # Express 앱 설정 (테스트용)
└── server.ts         # 서버 시작 (listen만)
```

### 응답 포맷 통일
```typescript
// 성공
{
  success: true,
  data: { /* 실제 데이터 */ }
}

// 실패 (400 VALIDATION_ERROR)
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "입력값이 유효하지 않습니다",
    details: {
      fieldErrors: {
        age: ["유효한 나이 범위가 아닙니다"],
        skinType: ["필수 값입니다"]
      }
    }
  }
}

// 실패 (404 NOT_FOUND)
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "진단 결과를 찾을 수 없습니다"
  }
}

// 실패 (500 SERVER_ERROR)
{
  success: false,
  error: {
    code: "SERVER_ERROR",
    message: "일시적 오류입니다. 다시 시도해주세요"
  }
}
```

---

## MVP 4가지 API

### 1️⃣ POST /surveys
설문 완료 시 데이터 저장 및 결과 계산

**요청**:
```json
{
  "sessionId": "yunn_abc123...",
  "city": "Delhi",
  "gender": "Female",
  "age": "25-34",
  "skinType": "Oily",
  "concerns": "Acne",
  "trigger": ["humidity", "stress"],
  "sensitivity": "Normal",
  "outdoor": "2-3h",
  "sunscreen": "Always",
  "sleep": "7-8h",
  "stress": "Low",
  "routineLevel": "Beginner",
  "photoUploaded": false
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "resultSkinType": "Oily",
    "resultConcernType": "Acne",
    "sessionId": "yunn_abc123..."
  }
}
```

**에러** (400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "fieldErrors": {
        "skinType": ["'Oily', 'Dry', 'Combination', 'Normal' 중 하나여야 합니다"]
      }
    }
  }
}
```

---

### 2️⃣ GET /surveys/:sessionId
최신 설문 결과 조회

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "skinType": "Oily",
    "concernType": "Acne",
    "gender": "Female",
    "age": "25-34",
    "createdAt": "2026-07-14T10:30:00Z"
  }
}
```

**에러** (404):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "진단 결과를 찾을 수 없습니다"
  }
}
```

---

### 3️⃣ GET /routine/:sessionId
루틴 시작일 + 체크 상태 조회

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "startDate": "2026-07-01",
    "checks": {
      "2026-07-01": {
        "morning": [true, false, true, false],
        "evening": [true, true, false, false]
      },
      "2026-07-02": {
        "morning": [true, true, false, true],
        "evening": [true, false, true, false]
      }
    }
  }
}
```

**에러** (404):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "루틴을 시작하지 않았습니다"
  }
}
```

---

### 4️⃣ PATCH /routine/:sessionId
특정 날짜의 아침/저녁 체크 저장 (upsert)

**요청**:
```json
{
  "dateKey": "2026-07-14",
  "morning": [true, false, true, false],
  "evening": [true, true, false, true]
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "dateKey": "2026-07-14",
    "morning": [true, false, true, false],
    "evening": [true, true, false, true]
  }
}
```

---

## 데이터 모델

### SurveySubmission 테이블
```typescript
model SurveySubmission {
  id                String   @id @default(cuid())
  sessionId         String
  city              String?
  gender            String?
  age               String?
  skinType          String?
  concern           String?
  trigger           String[]
  sensitivity       String?
  outdoor           String?
  sunscreen         String?
  sleep             String?
  stress            String?
  routineLevel      String?
  photoUploaded     Boolean  @default(false)
  resultSkinType    String   // 계산 결과
  resultConcernType String   // 계산 결과
  createdAt         DateTime @default(now())
  @@index([sessionId])
}
```

### RoutineCheck 테이블
```typescript
model RoutineCheck {
  id        String   @id @default(cuid())
  sessionId String
  dateKey   String   // "YYYY-MM-DD"
  morning   Boolean[] // 스텝별 체크
  evening   Boolean[]
  updatedAt DateTime @updatedAt
  @@unique([sessionId, dateKey])
}
```

---

## 프론트엔드 연동

### 환경변수
**프론트** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000   # 개발
# NEXT_PUBLIC_API_BASE_URL=https://yunn-api.onrender.com  # 프로덕션
```

### 주요 변경
1. `trackSurveyComplete()` → `fetch POST /surveys`로 교체
2. `getPendingResult()` → `fetch GET /surveys/:sessionId`로 교체
3. `getChecks()` → `fetch GET /routine/:sessionId`로 교체
4. `saveChecks()` → `fetch PATCH /routine/:sessionId`로 교체

---

## 실행 순서 (Phase별)

### Phase 1: 초기 세팅 (1일)
- [ ] Express 스캐폴딩 + 공통 에러 핸들러
- [ ] Prisma 설정 + PostgreSQL 연결
- [ ] DB 스키마 작성 및 마이그레이션

### Phase 2: 설문 API (2-3일)
- [ ] zod 스키마 작성 + 단위 테스트
- [ ] POST /surveys 구현 (테스트 우선)
- [ ] GET /surveys/:sessionId 구현

### Phase 3: 루틴 API (2일)
- [ ] GET /routine/:sessionId 구현
- [ ] PATCH /routine/:sessionId 구현

### Phase 4: 프론트 연동 (1-2일)
- [ ] 에러 UI 처리 (code별 분기)
- [ ] fetch 호출부 교체 및 테스트
- [ ] 오프라인 폴백 전략 적용

### Phase 5: 배포 (1일)
- [ ] 백엔드 배포 (Render/Railway)
- [ ] 프론트 환경변수 설정
- [ ] E2E 테스트

---

## 다음 문서
- 📄 [01-SETUP.md](./01-SETUP.md) - 초기 환경 설정
- 📄 [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) - DB 스키마 및 DBeaver 연결
- 📄 [03-API-SPECS.md](./03-API-SPECS.md) - 상세 API 스펙
- 📄 [04-IMPLEMENTATION-PLAN.md](./04-IMPLEMENTATION-PLAN.md) - TDD 단계별 계획
- 📄 [05-FRONTEND-CHANGES.md](./05-FRONTEND-CHANGES.md) - 프론트엔드 변경사항
- 📄 [06-DEPLOYMENT.md](./06-DEPLOYMENT.md) - 배포 및 환경 설정
