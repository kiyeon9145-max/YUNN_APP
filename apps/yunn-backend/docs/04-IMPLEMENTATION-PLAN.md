# 4. 단계별 구현 계획 (TDD)

---

## TDD 방식

**순서**: 테스트 작성 → 실패 확인 → 최소 구현 → 테스트 통과

각 API마다 동일한 패턴으로 진행합니다:
1. zod 스키마 작성 (입력값 검증 규칙)
2. 테스트 케이스 작성 (성공/실패 시나리오)
3. Repository 구현 (DB 접근)
4. 비즈니스 로직 구현 (계산/처리)
5. 라우터 구현 (HTTP 진입점)
6. 테스트 실행 (npm test)

---

## Phase 1: 기초 설정 (1일)

### 에러 처리 체계
`src/shared/errors/AppError.ts`에 에러 클래스들을 정의합니다:
- `AppError`: 기본 클래스 (code, message, statusCode, details)
- `ValidationError`: 입력값 검증 실패 (400 + fieldErrors)
- `NotFoundError`: 데이터 없음 (404)
- `ServerError`: 예기치 못한 에러 (500)

### 에러 미들웨어
`src/inbound/http/middleware/errorHandler.ts`에 Express 에러 핸들러를 작성합니다.
- AppError 인스턴스면 상태 코드와 함께 { success: false, error: {...} } 형식으로 응답
- 다른 에러면 500 SERVER_ERROR로 통일

### 성공 응답 유틸
`src/shared/utils/response.ts`에 sendSuccess() 함수를 작성합니다.
- { success: true, data: {...} } 형식으로 응답

### app.ts 설정
`src/app.ts`에서:
1. Express 인스턴스 생성
2. cors, express.json() 미들웨어 적용
3. 라우터 마운트 (나중에 추가)
4. 에러 핸들러를 마지막에 등록

### 실행 확인
```bash
npm run dev
# http://localhost:4000 에 접속하면 404 (정상)
```

---

## Phase 2: 설문 API (2-3일)

### Step 1: zod 스키마 작성
`src/shared/schemas/surveys.ts`에 SurveySubmitSchema를 정의합니다.

검증 규칙:
- sessionId: 필수 (string)
- skinType: 선택, enum (Oily/Dry/Combination/Normal)
- concerns: 선택, string
- trigger: 선택, string[]
- 나머지: 모두 선택

### Step 2: 테스트 작성
`src/inbound/http/routes/surveys.test.ts`에 supertest로 테스트를 작성합니다.

테스트 케이스:
- 필수값 누락 → 400 VALIDATION_ERROR
- 유효한 설문 → 200 성공, resultSkinType/resultConcernType 반환
- 정규화 테스트: "Uneven skin tone" → "Tone", "Acne marks" → "Marks"
- 존재하는 sessionId 조회 → 데이터 반환
- 없는 sessionId 조회 → 404 NOT_FOUND

### Step 3: Repository 구현
`src/outbound/persistence/surveyRepository.ts`에:
- `create(data)`: SurveySubmission 테이블에 insert
- `findLatestBySessionId(sessionId)`: 해당 sessionId의 최신 1개 조회

### Step 4: 비즈니스 로직
`src/application/surveys/submitSurvey.ts`에:
- 입력값으로 resultSkinType, resultConcernType 계산
- toConcernKey() 함수 (프론트의 result-data.ts에서 포팅)
- Repository.create() 호출해서 저장

`src/application/surveys/getSurvey.ts`에:
- Repository.findLatestBySessionId() 호출
- 없으면 NotFoundError throw
- 있으면 필드 정규화해서 반환

### Step 5: 라우터 구현
`src/inbound/http/routes/surveys.ts`에:
- POST /surveys: zod 검증 → submitSurvey() 호출 → sendSuccess()
- GET /surveys/:sessionId: getSurvey() 호출 → sendSuccess()

에러는 try-catch로 잡아서 next(err)로 전달 (에러 미들웨어가 처리)

### Step 6: 테스트 실행
```bash
npm test -- surveys.test.ts
```

---

## Phase 3: 루틴 API (2일)

### 동일한 패턴 적용

**zod 스키마** (`src/shared/schemas/routine.ts`):
- dateKey: YYYY-MM-DD 형식 검증
- morning/evening: 정확히 4개 boolean 배열

**테스트** (`src/inbound/http/routes/routine.test.ts`):
- GET: 루틴 존재 → startDate + checks 반환 / 없으면 404
- PATCH: 새 날짜 생성 / 기존 날짜 업데이트

**Repository** (`src/outbound/persistence/routineRepository.ts`):
- `findBySessionId(sessionId)`: 모든 RoutineCheck 조회 후 날짜별로 그룹화
- `upsert(sessionId, dateKey, data)`: 있으면 update, 없으면 create

**비즈니스 로직** (`src/application/routine/`):
- getRoutine(): 없으면 NotFoundError
- updateRoutine(): upsert 호출

**라우터** (`src/inbound/http/routes/routine.ts`):
- GET /routine/:sessionId
- PATCH /routine/:sessionId

---

## Phase 4: 통합 및 테스트

### app.ts에 모든 라우터 마운트
```typescript
app.use("/surveys", surveyRouter);
app.use("/routine", routineRouter);
app.use(errorHandler);
```

### 전체 테스트 실행
```bash
npm test
```

모든 테스트가 통과하면 준비 완료.

---

## 파일 체크리스트

| 파일 | 역할 |
|------|------|
| `src/shared/errors/AppError.ts` | 에러 클래스 정의 |
| `src/shared/utils/response.ts` | 성공 응답 유틸 |
| `src/shared/utils/normalize.ts` | toConcernKey() 함수 |
| `src/shared/schemas/surveys.ts` | SurveySubmitSchema |
| `src/shared/schemas/routine.ts` | RoutineUpdateSchema |
| `src/inbound/http/middleware/errorHandler.ts` | 에러 미들웨어 |
| `src/inbound/http/routes/surveys.ts` | POST/GET /surveys |
| `src/inbound/http/routes/routine.ts` | GET/PATCH /routine |
| `src/inbound/http/routes/surveys.test.ts` | 설문 API 테스트 |
| `src/inbound/http/routes/routine.test.ts` | 루틴 API 테스트 |
| `src/application/surveys/submitSurvey.ts` | 설문 저장 로직 |
| `src/application/surveys/getSurvey.ts` | 설문 조회 로직 |
| `src/application/routine/getRoutine.ts` | 루틴 조회 로직 |
| `src/application/routine/updateRoutine.ts` | 루틴 업데이트 로직 |
| `src/outbound/persistence/surveyRepository.ts` | Survey DB 접근 |
| `src/outbound/persistence/routineRepository.ts` | Routine DB 접근 |

---

## 개발 팁

### vitest + supertest 사용법
- vitest: 프론트와 동일한 테스트 프레임워크
- supertest: Express 앱을 테스트하는 도구 (실제 포트 불필요)
- app.ts를 직접 import해서 `request(app).post/get/patch()` 호출

### zod 에러 처리
- `schema.safeParse(data)` 호출
- 실패하면 `result.error.flatten().fieldErrors` 접근 (필드별 에러)
- ValidationError throw

### 테스트 데이터 관리
- beforeAll: DB 연결 + 테스트 데이터 생성
- afterAll: 테스트 데이터 정리 + 연결 해제
- 각 테스트는 독립적으로 실행

### 로컬 수동 테스트
```bash
npm run dev
# 다른 터미널에서
curl -X POST http://localhost:4000/surveys \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","concerns":"Acne","photoUploaded":false}'
```

---

## 다음: 프론트 연동

**다음**: [05-FRONTEND-CHANGES.md](./05-FRONTEND-CHANGES.md) - 프론트엔드에서 API 호출
