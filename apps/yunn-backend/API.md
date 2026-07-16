# YUNN 백엔드 REST API 문서

## 개요

YUNN 백엔드는 설문과 루틴 추적 기능을 제공하는 REST API입니다.

**기본 URL**: `http://localhost:4000` (개발 환경)

---

## 🔄 데이터 흐름

```
사용자 → 설문 완료 (POST /surveys)
       ↓
     결과 확인 (GET /surveys/:sessionId)
       ↓
     루틴 시작 (PATCH /routine/:sessionId)
       ↓
     루틴 추적 (GET /routine/:sessionId)
```

---

## 📌 공통 규칙

### 응답 형식

모든 응답은 다음 형식을 따릅니다:

```json
{
  "success": true,
  "data": {
    // API별 응답 데이터
  }
}
```

또는 에러 발생 시:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "에러 메시지",
    "details": {
      "fieldErrors": {
        "필드명": ["에러 메시지"]
      }
    }
  }
}
```

### HTTP 상태 코드

| 코드 | 의미 | 예시 |
|------|------|------|
| 200 | 성공 | 데이터 저장/조회 완료 |
| 400 | 입력값 검증 실패 | 빈 sessionId, 잘못된 날짜 |
| 404 | 찾을 수 없음 | 설문/루틴 데이터 없음 |
| 500 | 서버 에러 | DB 연결 실패 |

---

## 📋 API 엔드포인트

### 1. 설문 제출

**POST** `/surveys`

사용자 설문을 저장합니다.

#### 요청

```bash
curl -X POST http://localhost:4000/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user_123_abc",
    "photoUploaded": true,
    "gender": "Male",
    "age": "30-39",
    "city": "Seoul",
    "skinType": "Oily",
    "concerns": "Acne",
    "trigger": ["Stress", "Weather"],
    "sensitivity": "Sensitive",
    "outdoor": "1-2 times a week",
    "sunscreen": "Always",
    "sleep": "6-8 hours",
    "stress": "Medium",
    "routineLevel": "Intermediate"
  }'
```

#### 필수 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `sessionId` | string | 사용자 세션 ID (1-255자) |
| `photoUploaded` | boolean | 피부 사진 업로드 여부 |

#### 선택 필드

| 필드 | 타입 | 값 예시 |
|------|------|--------|
| `gender` | string | Male, Female, Other |
| `age` | string | 10-19, 20-29, ..., 60+ |
| `city` | string | Seoul, Busan, ... |
| `skinType` | string | Dry, Combination, Oily, Normal |
| `concerns` | string | Acne, Pigmentation, Uneven skin tone, ... |
| `trigger` | string[] | ["Stress", "Weather", "Diet"] |
| `sensitivity` | string | Normal, Sensitive, Very sensitive |
| `outdoor` | string | 자유 입력 |
| `sunscreen` | string | Always, Sometimes, Rarely, Never |
| `sleep` | string | 자유 입력 |
| `stress` | string | Low, Medium, High, Very high |
| `routineLevel` | string | Beginner, Intermediate, Advanced |

#### 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "resultSkinType": "Oily",
    "resultConcernType": "Acne"
  }
}
```

#### 에러 응답 (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값 검증 실패",
    "details": {
      "fieldErrors": {
        "sessionId": ["sessionId는 필수입니다"]
      }
    }
  }
}
```

---

### 2. 설문 결과 조회

**GET** `/surveys/:sessionId`

특정 sessionId의 최근 설문 결과를 조회합니다.

#### 요청

```bash
curl http://localhost:4000/surveys/user_123_abc
```

#### 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "skinType": "Oily",
    "concernType": "Acne",
    "gender": "Male",
    "age": "30-39",
    "city": "Seoul",
    "photoUploaded": true,
    "createdAt": "2026-07-14T10:30:00Z"
  }
}
```

#### 에러 응답 (404 Not Found)

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

### 3. 루틴 체크 저장/업데이트

**PATCH** `/routine/:sessionId`

특정 날짜의 루틴 체크를 저장합니다. (같은 날짜로 요청하면 기존 데이터 덮어씀 - Upsert)

#### 요청

```bash
curl -X PATCH http://localhost:4000/routine/user_123_abc \
  -H "Content-Type: application/json" \
  -d '{
    "dateKey": "2026-07-14",
    "morning": [true, false, true, false],
    "evening": [true, true, false, true]
  }'
```

#### 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `dateKey` | string | 날짜 (YYYY-MM-DD 형식, UTC 기준) |
| `morning` | boolean[] | 아침 루틴 체크 (정확히 4개 boolean) |
| `evening` | boolean[] | 저녁 루틴 체크 (정확히 4개 boolean) |

#### 날짜 유효성

- 형식: `YYYY-MM-DD` (예: 2026-07-14)
- ❌ 유효하지 않은 날짜는 거부:
  - `2026-02-30` (2월은 최대 29일)
  - `2025-02-29` (비윤년)
  - `2026-13-01` (13월은 없음)
  - `0000-00-00` (모든 0)

#### 응답 (200 OK)

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

#### 에러 응답 (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값 검증 실패",
    "details": {
      "fieldErrors": {
        "dateKey": ["유효하지 않은 날짜입니다"],
        "morning": ["정확히 4개 요소여야 합니다"]
      }
    }
  }
}
```

---

### 4. 루틴 데이터 조회

**GET** `/routine/:sessionId`

특정 sessionId의 모든 루틴 데이터를 조회합니다.

#### 요청

```bash
curl http://localhost:4000/routine/user_123_abc
```

#### 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "startDate": "2026-07-01",
    "checks": {
      "2026-07-01": {
        "morning": [true, false, true, false],
        "evening": [true, true, false, true]
      },
      "2026-07-02": {
        "morning": [false, true, false, true],
        "evening": [false, false, false, false]
      },
      "2026-07-03": {
        "morning": [true, true, true, true],
        "evening": [true, true, true, true]
      }
    }
  }
}
```

#### 응답 설명

| 필드 | 설명 |
|------|------|
| `startDate` | 루틴 시작일 (가장 오래된 데이터의 날짜) |
| `checks` | 날짜별 체크 데이터 (시간순 정렬) |

---

## 🧪 테스트

### 단위 테스트 실행

```bash
npm run test
```

### 타입 체크

```bash
npm run type:check
```

---

## 📊 데이터베이스 스키마

### SurveySubmission (설문)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 주키 |
| sessionId | string | 사용자 세션 ID |
| gender | string | null | 성별 |
| age | string | null | 연령대 |
| city | string | null | 거주 도시 |
| skinType | string | 피부 타입 |
| concerns | string | null | 피부 고민 |
| trigger | string[] | [] | 악화 요인 |
| ... | ... | ... |
| createdAt | datetime | 생성 시간 |

### RoutineCheck (루틴)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 주키 |
| sessionId | string | 사용자 세션 ID |
| dateKey | string | 날짜 (YYYY-MM-DD) |
| morning | boolean[] | 아침 체크 |
| evening | boolean[] | 저녁 체크 |
| createdAt | datetime | 생성 시간 |
| updatedAt | datetime | 수정 시간 |

**유니크 제약**: `(sessionId, dateKey)` - 같은 날짜에 1개만 존재

---

## ⚠️ 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| VALIDATION_ERROR | 400 | 입력값 검증 실패 |
| NOT_FOUND | 404 | 데이터 찾을 수 없음 |
| SERVER_ERROR | 500 | 서버 내부 에러 |

---

## 📝 사용 예시

### 1. 설문 완료 플로우

```bash
# 1. 설문 제출
curl -X POST http://localhost:4000/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user_session_123",
    "photoUploaded": true,
    "skinType": "Oily",
    "concerns": "Acne"
  }'

# 2. 결과 확인
curl http://localhost:4000/surveys/user_session_123
```

### 2. 루틴 추적 플로우

```bash
# 1. 첫 날 루틴 저장
curl -X PATCH http://localhost:4000/routine/user_session_123 \
  -H "Content-Type: application/json" \
  -d '{
    "dateKey": "2026-07-14",
    "morning": [true, true, true, true],
    "evening": [false, true, false, true]
  }'

# 2. 다음 날 루틴 저장
curl -X PATCH http://localhost:4000/routine/user_session_123 \
  -H "Content-Type: application/json" \
  -d '{
    "dateKey": "2026-07-15",
    "morning": [true, false, true, false],
    "evening": [true, true, true, true]
  }'

# 3. 모든 루틴 데이터 조회
curl http://localhost:4000/routine/user_session_123
```

---

## 🔐 보안 주의사항

- sessionId는 사용자별로 고유해야 합니다
- 민감한 개인정보는 저장하지 않습니다 (이름, 이메일, 전화번호 제외)
- 모든 입력값은 서버에서 검증합니다
- CORS는 필요에 따라 설정합니다

---

## 📚 OpenAPI 스펙

전체 OpenAPI 3.0 스펙은 `openapi.yaml` 파일을 참조하세요.

Swagger UI를 통해 대화형 문서를 확인할 수 있습니다:
- http://localhost:4000/api-docs (배포 후 지원 예정)
