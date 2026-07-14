# 3. API 스펙 명세

---

## 응답 포맷 (공통)

모든 API는 다음 형식으로 응답합니다.

### 성공 (200 OK)
```json
{
  "success": true,
  "data": { /* API별 데이터 */ }
}
```

### 검증 실패 (400)
입력값이 zod 검증에 통과하지 못한 경우:
- code: `VALIDATION_ERROR`
- details.fieldErrors: 필드별 에러 메시지 배열

### 찾을 수 없음 (404)
요청한 리소스가 없는 경우:
- code: `NOT_FOUND`
- message: 상황에 맞는 메시지

### 서버 에러 (500)
예기치 못한 에러:
- code: `SERVER_ERROR`
- message: "일시적 오류입니다. 다시 시도해주세요"

---

## API 1: POST /surveys

**설명**: 설문 완료 시 저장 및 결과 계산

### 요청

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| sessionId | string | ✅ | 사용자 세션 ID |
| city | string | ❌ | 도시 |
| gender | string | ❌ | "Male", "Female", "Other" |
| age | string | ❌ | "18-24", "25-34", "35-44" 등 |
| skinType | string | ❌ | "Oily", "Dry", "Combination", "Normal" |
| concerns | string | ❌ | "Acne", "Acne marks", "Uneven skin tone", "Pigmentation" |
| trigger | string[] | ❌ | ["humidity", "stress", ...] |
| sensitivity | string | ❌ | "Normal", "Sensitive", "Very sensitive" |
| outdoor | string | ❌ | "Under 1h", "1-2h", "2-3h", "3h+" |
| sunscreen | string | ❌ | "Always", "Sometimes", "Rarely", "Never" |
| sleep | string | ❌ | "Under 5h", "5-6h", "6-7h", "7-8h", "8h+" |
| stress | string | ❌ | "Low", "Medium", "High", "Very high" |
| routineLevel | string | ❌ | "Beginner", "Intermediate", "Advanced" |
| photoUploaded | boolean | ✅ | 사진 업로드 여부 |

### 응답 (200 OK)
성공하면 계산된 피부 타입과 고민 타입을 반환합니다.

```json
{
  "success": true,
  "data": {
    "resultSkinType": "Oily",
    "resultConcernType": "Acne",
    "sessionId": "yunn_abc123...",
    "createdAt": "2026-07-14T10:30:00.000Z"
  }
}
```

### 정규화 규칙
- concerns 필드:
  - "Uneven skin tone" → resultConcernType: "Tone"
  - "Acne marks" → resultConcernType: "Marks"
  - 그 외 → 그대로 사용

### 에러 예시 (400)
필수값 누락이나 enum 값이 잘못된 경우:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 유효하지 않습니다",
    "details": {
      "fieldErrors": {
        "sessionId": ["필수 입력값입니다"],
        "skinType": ["'Oily', 'Dry', 'Combination', 'Normal' 중 하나여야 합니다"]
      }
    }
  }
}
```

---

## API 2: GET /surveys/:sessionId

**설명**: 최신 설문 결과 조회 (다른 기기에서도 접근 가능)

### 요청
```
GET /surveys/yunn_abc123xyz...
```

### 응답 (200 OK)
해당 sessionId의 최신 설문 1개를 반환합니다.

```json
{
  "success": true,
  "data": {
    "skinType": "Oily",
    "concernType": "Acne",
    "gender": "Female",
    "age": "25-34",
    "city": "Delhi",
    "createdAt": "2026-07-14T10:30:00.000Z"
  }
}
```

### 에러 (404)
설문이 없는 경우:

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

## API 3: GET /routine/:sessionId

**설명**: 루틴 시작일 + 모든 날짜의 체크 상태 조회

### 요청
```
GET /routine/yunn_abc123xyz...
```

### 응답 (200 OK)
루틴 시작일과 날짜별 체크 상태를 반환합니다.

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

### 데이터 설명

| 필드 | 설명 |
|------|------|
| startDate | 루틴 시작일 (YYYY-MM-DD) |
| checks | 날짜별 체크 데이터 |
| checks[dateKey].morning | 아침 4개 스텝 체크 (인덱스 0-3) |
| checks[dateKey].evening | 저녁 4개 스텝 체크 (인덱스 0-3) |

### 에러 (404)
루틴을 시작하지 않았거나 데이터가 없는 경우:

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

## API 4: PATCH /routine/:sessionId

**설명**: 특정 날짜의 체크 상태 저장 (없으면 생성, 있으면 업데이트)

### 요청

```json
{
  "dateKey": "2026-07-14",
  "morning": [true, false, true, false],
  "evening": [true, true, false, true]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| dateKey | string | ✅ | 날짜 (YYYY-MM-DD 형식) |
| morning | boolean[] | ✅ | 아침 4개 스텝 체크 |
| evening | boolean[] | ✅ | 저녁 4개 스텝 체크 |

### 응답 (200 OK)
저장된 데이터를 반환합니다.

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

### 에러 (400)
날짜 형식이 잘못되거나 배열 길이가 4가 아닌 경우:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 유효하지 않습니다",
    "details": {
      "fieldErrors": {
        "dateKey": ["YYYY-MM-DD 형식이어야 합니다"],
        "morning": ["정확히 4개 요소여야 합니다"]
      }
    }
  }
}
```

---

## cURL 예제

### POST /surveys
```bash
curl -X POST http://localhost:4000/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "yunn_test_123",
    "city": "Delhi",
    "skinType": "Oily",
    "concerns": "Acne",
    "photoUploaded": false
  }'
```

### GET /surveys/:sessionId
```bash
curl http://localhost:4000/surveys/yunn_test_123
```

### GET /routine/:sessionId
```bash
curl http://localhost:4000/routine/yunn_test_123
```

### PATCH /routine/:sessionId
```bash
curl -X PATCH http://localhost:4000/routine/yunn_test_123 \
  -H "Content-Type: application/json" \
  -d '{
    "dateKey": "2026-07-14",
    "morning": [true, false, true, false],
    "evening": [true, true, false, true]
  }'
```

---

## 응답 코드 요약

| HTTP | code | 상황 |
|------|------|------|
| 200 | - | 성공 |
| 400 | VALIDATION_ERROR | 입력값 검증 실패 |
| 404 | NOT_FOUND | 데이터/리소스 없음 |
| 500 | SERVER_ERROR | 서버 에러 |

---

## 다음: 구현 계획

**다음**: [04-IMPLEMENTATION-PLAN.md](./04-IMPLEMENTATION-PLAN.md) - TDD 단계별 구현
