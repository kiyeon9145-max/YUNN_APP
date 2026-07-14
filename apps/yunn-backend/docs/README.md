# YUNN 백엔드 - 실행 계획 문서

**프로젝트**: YUNN 미션7 백엔드 개발  
**기간**: 2026-07-14 ~ (TBD)  
**목표**: Google Sheets 기반 방식 → REST API 기반 서버로 전환  
**팀**: 백엔드 개발자, 프론트엔드 개발자

---

## 📚 문서 구성

### 1. [00-OVERVIEW.md](./00-OVERVIEW.md) — 프로젝트 개요
- 현재 상태 분석 (문제점)
- 목표 상태 정의
- 기술 스택 선택
- 아키텍처 설계 (헥사고날)
- 4개 핵심 API 개요
- 데이터 모델 (Prisma)
- 프로젝트 Phase별 일정

👉 **먼저 읽기**: 전체 프로젝트를 이해하기 위해 필수

---

### 2. [01-SETUP.md](./01-SETUP.md) — 초기 환경 설정
- 프로젝트 폴더 구조 확인
- 필요 패키지 설치 (Express, Prisma, zod, vitest 등)
- 환경변수 설정 (.env)
- TypeScript 설정 확인
- Express 앱 초기화 (app.ts, server.ts 분리)
- Prisma 초기화

👉 **다음 읽기**: 개발 환경 셋업 (1시간 소요)

---

### 3. [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) — 데이터베이스 설정
- PostgreSQL 준비 (로컬/Docker/Supabase)
- **DBeaver 연결 설정** ← 직접 연결 방식
- Prisma 스키마 작성 (SurveySubmission, RoutineCheck)
- 마이그레이션 생성 및 실행
- Repository 패턴으로 DB 접근 레이어 작성
- 연결 테스트 (Prisma Studio)

👉 **다음 읽기**: 데이터베이스 설정 (1-2시간 소요)

---

### 4. [03-API-SPECS.md](./03-API-SPECS.md) — API 상세 스펙
- 응답 포맷 통일 (success/error)
- **API 1**: POST /surveys (설문 저장 + 결과 계산)
- **API 2**: GET /surveys/:sessionId (설문 결과 조회)
- **API 3**: GET /routine/:sessionId (루틴 조회)
- **API 4**: PATCH /routine/:sessionId (루틴 저장)
- 각 API의 요청/응답 예시
- cURL 테스트 커맨드

👉 **참고용**: API 개발 시 계속 참조

---

### 5. [04-IMPLEMENTATION-PLAN.md](./04-IMPLEMENTATION-PLAN.md) — TDD 단계별 구현
- **Phase 1**: 기초 설정 (에러 핸들러, 응답 포맷)
- **Phase 2**: 설문 API (zod 스키마 → 테스트 → 구현)
- **Phase 3**: 루틴 API (동일 패턴)
- **Phase 4**: 앱 통합 및 전체 테스트
- 파일 위치와 함수 구조
- 테스트 케이스 예시 (vitest + supertest)

👉 **개발 중 사용**: TDD 순서대로 구현

---

### 6. [05-FRONTEND-CHANGES.md](./05-FRONTEND-CHANGES.md) — 프론트엔드 연동
- 환경변수 설정 (NEXT_PUBLIC_API_BASE_URL)
- API 클라이언트 함수 작성 (api-client.ts)
- 기존 로직 교체 (localStorage → API 호출)
- 에러 UI 처리 (필드 에러, 서버 에러, 네트워크 에러)
- 오프라인 우선 패턴 (로컬 먼저 저장, 백그라운드 동기화)
- E2E 테스트 전략

👉 **프론트엔드 팀 읽기**: API 준비 후 연동 작업

---

### 7. [06-DEPLOYMENT.md](./06-DEPLOYMENT.md) — 배포 및 운영
- 배포 플랫폼 선택 (Render 권장, Railway 대안)
- **Render 배포**: 단계별 설정 + 환경변수
- **Railway 배포**: 대체 옵션
- 프로덕션 PostgreSQL 설정
- 프론트엔드 환경변수 설정
- E2E 테스트 (배포 후)
- 모니터링 및 문제 해결
- 배포 체크리스트

👉 **배포 시 사용**: 프로덕션 환경 준비

---

## 🚀 빠른 시작 (협업자용)

### 백엔드 개발자
1. **00-OVERVIEW** 읽기 (프로젝트 이해)
2. **01-SETUP** 따라하기 (환경 준비)
3. **02-DATABASE-SCHEMA** 따라하기 (DB 설정)
4. **04-IMPLEMENTATION-PLAN** 참고하면서 코딩 (TDD)
5. 구현 완료 후 **05-FRONTEND-CHANGES**을 프론트엔드 팀에 공유

### 프론트엔드 개발자
1. **00-OVERVIEW** 에서 아키텍처 이해
2. **03-API-SPECS** 에서 4개 API 스펙 확인
3. 백엔드 배포 완료 후 **05-FRONTEND-CHANGES** 따라하기
4. **06-DEPLOYMENT** 에서 환경변수 설정

### 팀 리드 또는 PM
1. **00-OVERVIEW** 전체 읽기
2. **04-IMPLEMENTATION-PLAN** 에서 Phase별 일정 확인
3. **06-DEPLOYMENT** 에서 배포 일정 검토

---

## 📋 폴더 구조 (참고)

```
yunn-backend/
├── docs/                  ← 이 문서들
│   ├── README.md         (← 지금 읽고 있는 파일)
│   ├── 00-OVERVIEW.md    (프로젝트 개요)
│   ├── 01-SETUP.md       (초기 설정)
│   ├── 02-DATABASE-SCHEMA.md (DB 설정)
│   ├── 03-API-SPECS.md   (API 스펙)
│   ├── 04-IMPLEMENTATION-PLAN.md (구현 계획)
│   ├── 05-FRONTEND-CHANGES.md (프론트 연동)
│   └── 06-DEPLOYMENT.md  (배포)
├── prisma/
│   └── schema.prisma     (데이터 모델)
├── src/
│   ├── inbound/          (HTTP 라우터)
│   ├── application/      (비즈니스 로직)
│   ├── outbound/         (DB 접근)
│   ├── shared/           (zod, 에러, 유틸)
│   ├── app.ts            (Express 설정)
│   └── server.ts         (서버 시작)
├── .env                  (로컬 환경변수 - 커밋 X)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## ✅ 체크리스트 (마일스톤별)

### Milestone 1: 초기 셋업 (1일)
- [ ] 01-SETUP 완료 (개발 환경 준비)
- [ ] 02-DATABASE 완료 (DB 연결 확인)
- [ ] DBeaver에서 테이블 조회 가능

### Milestone 2: 설문 API (2-3일)
- [ ] POST /surveys 구현 (테스트 통과)
- [ ] GET /surveys/:sessionId 구현 (테스트 통과)
- [ ] cURL로 수동 테스트 성공

### Milestone 3: 루틴 API (2일)
- [ ] GET /routine/:sessionId 구현
- [ ] PATCH /routine/:sessionId 구현
- [ ] 통합 테스트 (npm test 전체 통과)

### Milestone 4: 배포 (1-2일)
- [ ] 백엔드 Render/Railway 배포 완료
- [ ] 프론트 api-client.ts 구현
- [ ] 프론트에서 API 호출 테스트 성공
- [ ] E2E 테스트 완료

---

## 🤝 협업 방식

### 커뮤니케이션
- 각 문서의 "질문 사항" 섹션에서 이슈 제기 가능
- PR 시 `docs/` 폴더의 변경사항도 함께 리뷰

### 코드 리뷰
- 04-IMPLEMENTATION-PLAN 기반으로 구현
- 테스트 우선 (TDD)
- API 스펙 (03-API-SPECS) 준수 필수

### 버전 관리
- `master` 브랜치에 푸시
- Render/Railway는 자동 배포

---

## 📞 문의 사항

- 아키텍처 관련: 00-OVERVIEW 검토
- API 스펙: 03-API-SPECS 확인
- 구현 방식: 04-IMPLEMENTATION-PLAN 참고
- 배포 문제: 06-DEPLOYMENT 의 "문제 해결" 섹션

---

## 🎯 성공의 정의

이 프로젝트는 다음을 달성하면 성공입니다:

✅ **기능**:
- 4개 API 모두 구현 및 테스트 통과
- 설문 결과를 DB에 저장 & 조회 가능
- 루틴 체크를 DB에 저장 & 조회 가능

✅ **운영**:
- 백엔드 배포 완료 (Render 또는 Railway)
- 프론트에서 API 호출 성공
- E2E 테스트 완료

✅ **품질**:
- 통일된 응답 포맷 (success/error)
- 체계적인 에러 처리
- 테스트 커버리지 (TDD)

---

## 🔄 다음 스프린트 예상

### Sprint 8 (심화)
- JWT 인증 추가 (세션 → 계정 마이그레이션)
- 사진 업로드 API (파일 스토리지)
- 사용자 데이터 격리 (멀티 테넌트)

### Sprint 9 (고도화)
- 성분 체크 분석 API
- 상품 추천 로직
- 구독 관리

---

**문서 작성**: 2026-07-14  
**최종 업데이트**: (TBD)  
**협업 팀**: 백엔드, 프론트엔드, 인프라

Happy coding! 🚀
