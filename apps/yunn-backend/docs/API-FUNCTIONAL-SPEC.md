# YUNN API 기능 명세서

- 기준 버전: 2026-07-20 (main, `e3e3088`)
- 소스: `src/inbound/http/routes`, `src/application`, `src/shared/schemas`, `prisma/schema.prisma`
- Base URL: 로컬 `http://localhost:4000` (프론트 `NEXT_PUBLIC_YUNN_API_ENDPOINT`로 오버라이드)
- 공통 응답 포맷
  - 성공: `{ "success": true, "data": {...} }`
  - 실패: `{ "success": false, "error": { "code": string, "message": string, "details"?: {...} } }`
- 공통 미들웨어: `cors()`, `express.json()`, 마지막에 `errorHandler` (AppError 외 예외는 500 `SERVER_ERROR`로 변환)

## 0. GET /health

헬스 체크. 인증/검증 없음.

- 응답 200: `{ "success": true, "data": { "status": "ok" } }`

---

## 1. 설문 (Survey) — `/surveys`

### 1-1. POST /surveys — 설문 저장 및 결과 계산

**요청 본문** (`SurveySubmitSchema`, `src/shared/schemas/surveys.ts`)

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| sessionId | string | O | 빈 문자열 불가 |
| city | string | - | |
| gender | enum | - | `Male` \| `Female` \| `Prefer not to say` |
| age | string | - | |
| skinType | enum | - | `Oily` \| `Dry` \| `Combination` \| `Normal` |
| concerns | string | - | 결과 계산에 사용 |
| trigger | string[] | - | 항상 배열로 전달 |
| sensitivity | enum | - | `Rarely` \| `Sometimes` \| `Easily` \| `Very sensitive` |
| outdoor | string | - | |
| sunscreen | enum | - | `Every day` \| `Most days` \| `Occasionally` \| `Rarely` |
| sleep | string | - | |
| stress | enum | - | `Low` \| `Medium` \| `High` \| `Very high` |
| routineLevel | enum | - | `Nothing` \| `Wash only` \| `Basic` \| `Multi` |
| photoUploaded | boolean | O | |

**처리 로직** (`application/surveys/submitSurvey.ts`)

1. `resultSkinType` = `skinType` 값 그대로 (없으면 `null`)
2. `resultConcernType` = `concerns`를 `normalize.ts`의 `toConcernKey`로 정규화
   - `"Uneven skin tone"` → `"Tone"`
   - `"Acne marks"` → `"Marks"`
   - 매핑 외 값은 원문 유지, 값 없으면 `null`
3. `SurveySubmission` 테이블에 INSERT (매 제출마다 새 row 생성 — sessionId 기준 upsert 아님)
4. 저장 성공/실패를 콘솔에 로깅

**응답 200**

```json
{
  "success": true,
  "data": {
    "resultSkinType": "Oily",
    "resultConcernType": "Tone",
    "sessionId": "...",
    "createdAt": "2026-07-20T12:00:00.000Z"
  }
}
```

**에러**
- 400 `VALIDATION_ERROR`: 스키마 검증 실패, `details.fieldErrors`에 필드별 메시지

### 1-2. GET /surveys/:sessionId — 최신 설문 결과 조회

**경로 파라미터**: `sessionId` (1~255자, `sessionIdSchema`)

**처리 로직** (`application/surveys/getSurvey.ts`)
- `SurveyRepository.findLatestBySessionId`로 해당 sessionId의 **가장 최근** 제출 1건 조회 (여러 번 제출 시 최신 것)
- 없으면 404

**응답 200**

```json
{
  "success": true,
  "data": {
    "skinType": "Oily",
    "concernType": "Tone",
    "gender": "Female",
    "age": "20s",
    "city": "Seoul",
    "photoUploaded": true,
    "createdAt": "2026-07-20T12:00:00.000Z"
  }
}
```

**에러**
- 400 `VALIDATION_ERROR`: sessionId 형식 오류
- 404 `NOT_FOUND`: `"진단 결과를 찾을 수 없습니다"`

---

## 2. 루틴 (Routine) — `/routine`

### 2-1. PATCH /routine/:sessionId — 루틴 체크 저장/업데이트

**경로 파라미터**: `sessionId` (1~255자)

**요청 본문** (`RoutineUpdateSchema`, `src/shared/schemas/routine.ts`)

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| dateKey | string | O | `YYYY-MM-DD`, 실존하는 날짜만 허용(윤년 등 검증) |
| morning | boolean[4] | O | 정확히 4개 요소 |
| evening | boolean[4] | O | 정확히 4개 요소 |

**처리 로직** (`application/routine/updateRoutine.ts`)
- `RoutineRepository.upsert(sessionId, dateKey, { morning, evening })`
- `(sessionId, dateKey)` 유니크 키 기준 upsert — 같은 날짜 재요청 시 덮어씀

**응답 200**

```json
{
  "success": true,
  "data": {
    "dateKey": "2026-07-20",
    "morning": [true, false, false, true],
    "evening": [false, false, false, false]
  }
}
```

**에러**
- 400 `VALIDATION_ERROR`: sessionId 또는 body 검증 실패 (날짜 형식/범위, 배열 길이 등)

### 2-2. GET /routine/:sessionId — 루틴 전체 조회

**경로 파라미터**: `sessionId`

**처리 로직** (`application/routine/getRoutine.ts`)
- 해당 sessionId의 모든 `RoutineCheck` row 조회
- 없으면 404
- `dateKey` → `{ morning, evening }` 맵으로 그룹화
- `startDate` = 조회된 row 중 **첫 번째 row의 dateKey** (`routineRepository.findBySessionId`가 `dateKey asc` 정렬로 조회하므로 가장 이른 날짜)

**응답 200**

```json
{
  "success": true,
  "data": {
    "startDate": "2026-07-01",
    "checks": {
      "2026-07-01": { "morning": [true, true, false, false], "evening": [false, false, false, false] },
      "2026-07-02": { "morning": [true, true, true, true], "evening": [true, true, true, true] }
    }
  }
}
```

**에러**
- 400 `VALIDATION_ERROR`: sessionId 형식 오류
- 404 `NOT_FOUND`: `"루틴을 시작하지 않았습니다"`

---

## 3. 데이터 모델 (Prisma)

**SurveySubmission** — 설문 제출은 append-only, sessionId당 여러 row 가능
- `id, sessionId, city?, gender?, age?, skinType?, concerns?, trigger[], sensitivity?, outdoor?, sunscreen?, sleep?, stress?, routineLevel?, photoUploaded, resultSkinType?, resultConcernType?, createdAt`
- 인덱스: `sessionId`

**RoutineCheck** — sessionId+dateKey 유니크, upsert 대상
- `id, sessionId, dateKey, morning: Boolean[], evening: Boolean[], createdAt, updatedAt`
- 유니크: `(sessionId, dateKey)`, 인덱스: `sessionId`

---

## 4. 에러 코드 요약

| code | HTTP | 발생 위치 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 모든 라우트 입력 검증 실패 (Zod) |
| `NOT_FOUND` | 404 | 설문/루틴 미존재 |
| `SERVER_ERROR` | 500 | 미처리 예외 (errorHandler 기본값) |

## 5. 참고 문서
- 상세 스펙 원안: `docs/03-API-SPECS.md`
- OpenAPI 정의: `openapi.yaml`
- 간이 문서: `API.md`
