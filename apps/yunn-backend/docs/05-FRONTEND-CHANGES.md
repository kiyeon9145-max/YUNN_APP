# 5. 프론트엔드 변경사항

---

## 개요

백엔드 4개 API가 준비되면 프론트엔드에서 다음 4가지를 변경합니다:

1. **환경변수 추가**: `NEXT_PUBLIC_API_BASE_URL` 설정
2. **API 클라이언트 함수 작성**: 4개 API를 호출하는 fetch 함수
3. **기존 로직 교체**: localStorage 호출 대신 API 호출
4. **에러 UI 추가**: 서버 응답 에러를 화면에 표시

---

## 5.1 환경변수 설정

### 개발 환경
`apps/yunn-frontend/.env.local` 파일을 생성 또는 수정하여 다음을 추가합니다:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 프로덕션 환경 (배포 시)
Vercel Dashboard → Settings → Environment Variables에서:
- 이름: `NEXT_PUBLIC_API_BASE_URL`
- 값: `https://yunn-api.onrender.com` (또는 백엔드 배포 URL)

---

## 5.2 API 클라이언트 함수 작성

새 파일 `apps/yunn-frontend/app/lib/api-client.ts`를 생성합니다.

### 구조
- 기본 `apiFetch()` 헬퍼 함수 (에러 처리, 네트워크 실패 처리)
- 4개의 API 함수:
  - `submitSurvey()` - POST /surveys
  - `getSurvey()` - GET /surveys/:sessionId
  - `getRoutine()` - GET /routine/:sessionId
  - `updateRoutine()` - PATCH /routine/:sessionId

### 응답 타입 정의
각 함수는 `{ success: boolean; data?: T; error?: {...} }` 형태의 응답을 반환하도록 타입을 정의합니다.

### 예시 (1개만)
```typescript
// submitSurvey 함수 구조
async function submitSurvey(input: {
  sessionId: string;
  city?: string;
  gender?: string;
  // ... 기타 필드
  photoUploaded: boolean;
}): Promise<ApiResponse> {
  // apiFetch로 POST /surveys 호출
  // 성공 시: { resultSkinType, resultConcernType } 반환
  // 실패 시: error 정보 반환
}
```

---

## 5.3 설문 완료 후 API 호출

### 변경 대상
`apps/yunn-frontend/app/survey/survey-analytics.ts`의 `trackSurveyComplete()` 함수

### 현재 로직
- `sendSurveyCompletionToSheet()` 호출 (Google Sheets 비콘 전송)

### 변경 후 로직
- `submitSurvey()` API 호출
- 성공: 응답 데이터 (resultSkinType, resultConcernType) 사용
- 실패: 
  - VALIDATION_ERROR: 입력값이 유효하지 않으므로 폼에 에러 표시
  - NETWORK_ERROR: 사용자에게 재시도 권유
  - SERVER_ERROR: 토스트로 "일시적 오류입니다" 표시

### 폴백 전략 (선택)
네트워크 실패 시 기존 `savePendingResult()` 로컬 저장 유지 (데이터 손실 방지)

---

## 5.4 설문 결과 조회

### 변경 대상
`apps/yunn-frontend/app/routine/lib/routine-storage.ts`의 `getPendingResult()` 함수

### 현재 로직
- `readJSON(STORAGE_KEYS.PENDING_RESULT)` 호출 (localStorage에서만 읽음)

### 변경 후 로직
- `getSurvey(sessionId)` API 호출 시도
- 성공: 서버 데이터 반환
- 실패 (404): "진단 결과가 없습니다" 안내
- 실패 (네트워크): localStorage 폴백으로 기존 데이터 반환

### 장점
사용자가 다른 기기에서 접속해도 서버에서 설문 결과를 조회할 수 있음

---

## 5.5 루틴 데이터 조회 및 저장

### 조회 변경
`getRoutineStart()` + `getChecks()` 두 함수 호출 대신, `getRoutine(sessionId)`로 한 번에 조회합니다.

### 저장 변경
루틴 체크 저장 시 **오프라인 우선 패턴**을 적용합니다:
1. **즉시**: localStorage에 체크 상태 저장 (UI 반응성)
2. **백그라운드**: `updateRoutine()` API 호출 (서버와 동기화)
3. **실패 처리**: 동기화 실패 시 토스트로 사용자에게 알림

### 장점
- 오프라인 상태에서도 체크 기록 가능
- 온라인 복귀 시 자동 동기화
- 사용자 경험 저하 없음

---

## 5.6 에러 UI 처리

### 검증 실패 (400 VALIDATION_ERROR)
API 응답의 `error.details.fieldErrors`에 필드별 에러 메시지가 담깁니다.
- 각 입력 필드 아래에 인라인으로 에러 메시지 표시
- 예: "skinType" 필드에 "유효한 값이 아닙니다" 표시

### 서버 에러 (500 SERVER_ERROR)
- 토스트 알림 표시: "일시적 오류입니다. 다시 시도해주세요"
- 재시도 버튼 제공

### 네트워크 에러 (NETWORK_ERROR)
- 토스트 알림 표시: "네트워크에 연결할 수 없습니다"
- 폴백 옵션 제시 (예: 로컬 데이터 사용)

### 구현 방식
- 새 `ErrorToast` 컴포넌트 생성 또는 기존 알림 컴포넌트 재사용
- 에러 타입별로 UI 분기

---

## 5.7 테스트 전략

### 단위 테스트
- API 클라이언트 함수 테스트 (fetch mock)
- 성공/실패/네트워크 에러 케이스

### E2E 테스트
1. 백엔드 서버 실행 상태 확인
2. 프론트에서 설문 완료 → API 호출 → DB 저장 확인
3. 루틴 체크 저장 → 백그라운드 동기화 확인
4. 다른 기기/새 탭에서 데이터 조회 확인

---

## 5.8 배포 체크리스트

프론트엔드 팀이 확인할 항목:

- [ ] `.env.local`에 `NEXT_PUBLIC_API_BASE_URL` 추가
- [ ] `api-client.ts` 작성 (4개 함수)
- [ ] `survey-analytics.ts` 수정 (submitSurvey 호출)
- [ ] `routine-storage.ts` 수정 (API 호출 또는 폴백)
- [ ] 에러 UI 컴포넌트 추가
- [ ] 로컬 테스트 (백엔드 실행 상태)
- [ ] Vercel 배포 전 `NEXT_PUBLIC_API_BASE_URL` 설정

---

## 다음: 배포

**다음**: [06-DEPLOYMENT.md](./06-DEPLOYMENT.md) - 백엔드 배포 및 환경 설정
