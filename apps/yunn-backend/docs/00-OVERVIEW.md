# YUNN 백엔드 - 미션7 실행 계획

**기간**: 2026-07-14 ~ (TBD)  
**목표**: Google Sheets 비콘 방식 → REST API 기반 서버로 전환  
**스코프**: 설문 저장 + 루틴 트래킹 4개 API

---

## 문제와 해결책

### 현재 상태
- 설문: Google Apps Script로 일방향 전송만 가능 (조회 불가)
- 루틴: 100% localStorage (기기 변경 시 데이터 손실)
- 결과 계산: 클라이언트만 처리 (서버 검증 없음)
- 인증: 없음
- DB: 없음

### 목표
이번 스프린트 후 다음이 가능해집니다:
- 설문 데이터 서버 저장 및 조회
- 루틴 데이터 서버 저장 및 조회
- 서버에서 입력값 검증 (zod)
- PostgreSQL 기반 영구 저장소
- 통일된 에러 응답 포맷

---

## 기술 스택

**런타임/언어**: Node.js + TypeScript (프론트와 동일)  
**프레임워크**: Express.js (경량, 널리 쓰임)  
**DB**: PostgreSQL (프로덕션급)  
**ORM**: Prisma (타입 안전, 마이그레이션 자동)  
**검증**: zod (런타임 + 타입 추론)  
**테스트**: vitest + supertest (프론트와 동일)  
**배포**: Render 또는 Railway (Node 호스팅, 무료 티어)

---

## 아키텍처 개요

헥사고날 아키텍처로 설계합니다. 폴더별 역할:

- **inbound**: HTTP 라우터 & 미들웨어 (Express 진입점)
- **application**: 비즈니스 로직 (설문/루틴 저장 및 조회 로직)
- **outbound**: DB 접근 레이어 (Repository 패턴)
- **shared**: 공유 유틸 (zod 스키마, 에러 클래스, 타입)

app.ts와 server.ts는 분리됩니다. app.ts에서는 Express 인스턴스만 설정하고, server.ts에서만 listen()을 호출합니다. 이는 테스트에서 서버 포트 없이 app을 직접 supertest로 감싸기 위함입니다.

---

## 응답 포맷

모든 API 응답은 다음 형식을 따릅니다:

**성공**: `{ success: true, data: {...} }`  
**실패**: `{ success: false, error: { code, message, details? } }`

에러 코드:
- `VALIDATION_ERROR` (400): zod 검증 실패 → fieldErrors에 필드별 메시지
- `NOT_FOUND` (404): 데이터 없음
- `SERVER_ERROR` (500): 예기치 못한 에러

---

## MVP 4개 API

### API 1: POST /surveys
설문 완료 시 저장 및 결과 계산.

**요청**: sessionId와 설문 답변들 (city, gender, age, skinType, concerns 등 대부분 선택)  
**응답**: resultSkinType, resultConcernType 계산해서 반환  
**에러**: 입력값 검증 실패 시 fieldErrors 반환

현재: Google Sheets 비콘으로 전송 (응답 없음)  
변경: 서버에 저장, 결과 즉시 반환, DB 영구 저장

### API 2: GET /surveys/:sessionId
최신 설문 결과 조회.

**요청**: sessionId만 필요  
**응답**: skinType, concernType, gender, age, city, createdAt  
**에러**: 해당 세션의 설문이 없으면 404

현재: localStorage yunn_pending_result_data에서만 읽음  
변경: 서버에서 조회 가능 (다른 기기도 접근 가능)

### API 3: GET /routine/:sessionId
루틴 시작일 + 모든 날짜의 체크 상태 조회.

**요청**: sessionId  
**응답**: startDate와 checks (날짜별 morning/evening 배열)  
**에러**: 루틴을 시작하지 않았으면 404

현재: localStorage yunn_routine_start + yunn_routine_checks에서 읽음  
변경: 서버에서 모든 데이터 한 번에 조회

### API 4: PATCH /routine/:sessionId
특정 날짜의 체크 상태 저장 (upsert).

**요청**: dateKey와 morning/evening 배열  
**응답**: 저장된 데이터  
**에러**: 날짜 형식 오류는 검증 에러

현재: localStorage에만 저장  
변경: 서버에도 저장 + 오프라인 우선 패턴 사용

---

## 데이터 모델

### SurveySubmission
사용자가 작성한 설문 한 건을 나타냅니다.
- sessionId: 사용자 식별자
- 설문값들 (city, gender, age, skinType, concerns, trigger 등)
- resultSkinType/resultConcernType: 서버 계산 결과
- photoUploaded: 사진 업로드 여부
- createdAt: 저장 시각

### RoutineCheck
특정 날짜의 루틴 체크 상태.
- sessionId + dateKey: 유니크 조합
- morning/evening: 각각 4개 스텝의 boolean 배열

---

## 프론트엔드 변경

### 환경변수
개발: `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`  
프로덕션: Vercel에서 `https://yunn-api.onrender.com` 설정

### 함수 교체
1. `trackSurveyComplete()`: sendSurveyCompletionToSheet() 대신 API 호출
2. `getPendingResult()`: localStorage 대신 GET /surveys/:sessionId
3. `getChecks()/saveChecks()`: localStorage 대신 GET/PATCH /routine/:sessionId

### 에러 처리
- VALIDATION_ERROR: 필드 아래 인라인 메시지 표시
- SERVER_ERROR: 토스트 + 재시도 버튼
- NETWORK_ERROR: 사용자에게 알림

### 오프라인 폴백
루틴 체크 저장 시: localStorage에 먼저 저장 → 백그라운드에서 API 호출 → 실패해도 로컬 데이터는 유지

---

## 단계별 일정

| Phase | 내용 | 기간 | 담당 |
|-------|------|------|------|
| 1 | Express 기초 + DB 연결 | 1일 | 백엔드 |
| 2 | 설문 API (POST, GET) | 2-3일 | 백엔드 |
| 3 | 루틴 API (GET, PATCH) | 2일 | 백엔드 |
| 4 | 프론트 연동 + 에러 UI | 1-2일 | 프론트 |
| 5 | 배포 (Render/Railway) | 1일 | 인프라 |

---

## 다음 단계

각 단계별 문서를 참고하세요:
- 📄 [01-SETUP.md](./01-SETUP.md) — 환경 준비
- 📄 [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) — DB 설정 & DBeaver 연결
- 📄 [03-API-SPECS.md](./03-API-SPECS.md) — API 상세 스펙
- 📄 [04-IMPLEMENTATION-PLAN.md](./04-IMPLEMENTATION-PLAN.md) — TDD 단계별 구현
- 📄 [05-FRONTEND-CHANGES.md](./05-FRONTEND-CHANGES.md) — 프론트 연동
- 📄 [06-DEPLOYMENT.md](./06-DEPLOYMENT.md) — 배포
