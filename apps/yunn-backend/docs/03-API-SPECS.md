# 3. API 스펙 상세 정의

---

## 개요

총 4개의 REST API를 구현합니다. 모든 응답은 통일된 포맷을 사용합니다.

### 응답 포맷 (공통)

#### 성공 (200 OK)
```json
{
  "success": true,
  "data": { /* API별 데이터 */ }
}
```

#### 검증 실패 (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 유효하지 않습니다",
    "details": {
      "fieldErrors": {
        "skinType": ["'Oily', 'Dry', 'Combination', 'Normal' 중 하나여야 합니다"],
        "age": ["필수 입력값입니다"]
      }
    }
  }
}
```

#### 찾을 수 없음 (404 Not Found)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "요청한 리소스를 찾을 수 없습니다"
  }
}
```

#### 서버 에러 (500 Internal Server Error)
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "일시적 오류입니다. 다시 시도해주세요"
  }
}
```

---

## API 1: POST /surveys

### 설문 완료 저장 및 결과 계산

**설명**: 
- 사용자가 설문을 완료하면 서버에 저장
- 설문값 검증 (zod)
- resultSkinType, resultConcernType 계산 후 반환
- 기존: Google Sheets 비콘 대체

---

### 요청

#### URL
```
POST /surveys
```

#### Headers
```
Content-Type: application/json
```

#### Body
```typescript
{
  // 필수
  "sessionId": "yunn_abc123xyz...",
  "photoUploaded": false,
  
  // 선택 (대부분)
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
  "routineLevel": "Beginner"
}
```

#### Body 상세 설명

| 필드 | 타입 | 필수 | 설명 | 유효값 |
|------|------|------|------|--------|
| sessionId | string | ✅ | 사용자 세션 ID (localStorage yunn_session_id) | - |
| photoUploaded | boolean | ✅ | 사진 업로드 여부 | true/false |
| city | string | ❌ | 도시 | 모든 문자열 |
| gender | string | ❌ | 성별 | "Male", "Female", "Other" |
| age | string | ❌ | 나이대 | "18-24", "25-34", "35-44", "45-54", "55+" |
| skinType | string | ❌ | 피부 타입 | "Oily", "Dry", "Combination", "Normal" |
| concerns | string | ❌ | 주요 고민 | "Acne", "Acne marks", "Uneven skin tone", "Pigmentation" |
| trigger | string[] | ❌ | 트리거 배열 | ["humidity", "stress", "diet", ...] |
| sensitivity | string | ❌ | 민감도 | "Normal", "Sensitive", "Very sensitive" |
| outdoor | string | ❌ | 외출 시간 | "Under 1h", "1-2h", "2-3h", "3h+" |
| sunscreen | string | ❌ | 자외선차단제 사용 | "Always", "Sometimes", "Rarely", "Never" |
| sleep | string | ❌ | 수면 시간 | "Under 5h", "5-6h", "6-7h", "7-8h", "8h+" |
| stress | string | ❌ | 스트레스 수준 | "Low", "Medium", "High", "Very high" |
| routineLevel | string | ❌ | 루틴 경험도 | "Beginner", "Intermediate", "Advanced" |

---

### 응답

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "resultSkinType": "Oily",
    "resultConcernType": "Acne",
    "sessionId": "yunn_abc123xyz...",
    "createdAt": "2026-07-14T10:30:00.000Z"
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| resultSkinType | string | 계산된 피부 타입 |
| resultConcernType | string | 정규화된 고민 타입 ("Acne", "Marks", "Pigmentation", "Tone") |
| sessionId | string | 요청에서 받은 세션 ID (확인용) |
| createdAt | string | ISO 8601 시간 |

#### 검증 실패 (400)

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

### cURL 예제

```bash
curl -X POST http://localhost:4000/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "yunn_test_123",
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
  }'
```

---

## API 2: GET /surveys/:sessionId

### 최신 설문 결과 조회

**설명**:
- sessionId의 가장 최신 설문 결과 반환
- 기존: localStorage yunn_pending_result_data 대체

---

### 요청

#### URL
```
GET /surveys/:sessionId
```

**예**:
```
GET /surveys/yunn_abc123xyz...
```

#### Headers
```
Accept: application/json
```

---

### 응답

#### 성공 (200 OK)

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

| 필드 | 타입 | 설명 |
|------|------|------|
| skinType | string | 저장된 피부 타입 |
| concernType | string | 저장된 고민 타입 (정규화됨) |
| gender | string | 저장된 성별 |
| age | string | 저장된 나이대 |
| city | string | 저장된 도시 |
| createdAt | string | ISO 8601 시간 |

#### 찾을 수 없음 (404)

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

### cURL 예제

```bash
curl http://localhost:4000/surveys/yunn_abc123xyz...
```

---

## API 3: GET /routine/:sessionId

### 루틴 시작일 및 체크 상태 조회

**설명**:
- sessionId의 루틴 시작일 반환
- 모든 날짜별 아침/저녁 체크 상태 반환
- 기존: localStorage yunn_routine_start + yunn_routine_checks 대체

---

### 요청

#### URL
```
GET /routine/:sessionId
```

**예**:
```
GET /routine/yunn_abc123xyz...
```

---

### 응답

#### 성공 (200 OK)

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
      },
      "2026-07-03": {
        "morning": [false, false, false, false],
        "evening": [false, false, false, false]
      }
    }
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| startDate | string | 루틴 시작일 (YYYY-MM-DD) |
| checks | object | 날짜별 체크 상태 |
| checks[dateKey].morning | boolean[] | 아침 4개 스텝 체크 (index 0-3) |
| checks[dateKey].evening | boolean[] | 저녁 4개 스텝 체크 (index 0-3) |

#### 루틴 미시작 (404)

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

### cURL 예제

```bash
curl http://localhost:4000/routine/yunn_abc123xyz...
```

---

## API 4: PATCH /routine/:sessionId

### 특정 날짜 루틴 체크 저장/업데이트

**설명**:
- 특정 날짜(dateKey)의 아침/저녁 체크 상태 저장
- 해당 dateKey가 없으면 생성 (upsert)
- 첫 PATCH 호출 시 startDate 자동 설정
- 기존: localStorage yunn_routine_checks 쓰기 대체

---

### 요청

#### URL
```
PATCH /routine/:sessionId
```

**예**:
```
PATCH /routine/yunn_abc123xyz...
```

#### Headers
```
Content-Type: application/json
```

#### Body
```typescript
{
  "dateKey": "2026-07-14",
  "morning": [true, false, true, false],
  "evening": [true, true, false, true]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| dateKey | string | ✅ | 날짜 (YYYY-MM-DD) |
| morning | boolean[] | ✅ | 아침 4개 스텝 체크 |
| evening | boolean[] | ✅ | 저녁 4개 스텝 체크 |

---

### 응답

#### 성공 (200 OK)

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

#### 검증 실패 (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 유효하지 않습니다",
    "details": {
      "fieldErrors": {
        "dateKey": ["YYYY-MM-DD 형식이어야 합니다"],
        "morning": ["길이가 4여야 합니다"]
      }
    }
  }
}
```

---

### cURL 예제

```bash
curl -X PATCH http://localhost:4000/routine/yunn_abc123xyz... \
  -H "Content-Type: application/json" \
  -d '{
    "dateKey": "2026-07-14",
    "morning": [true, false, true, false],
    "evening": [true, true, false, true]
  }'
```

---

## 다음: 구현 계획

**다음**: [04-IMPLEMENTATION-PLAN.md](./04-IMPLEMENTATION-PLAN.md) - TDD 단계별 구현
