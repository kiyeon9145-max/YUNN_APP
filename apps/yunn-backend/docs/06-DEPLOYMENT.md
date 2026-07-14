# 6. 배포 및 환경 설정

---

## 개요

백엔드 API를 프로덕션 환경에 배포하기 위한 단계를 설명합니다.

---

## 6.1 배포 플랫폼 선택

### 옵션별 비교

| 플랫폼 | 특징 | 비용 | 추천 |
|--------|------|------|-----|
| **Render** | Node.js 호스팅, 무료 티어 있음, 자동 배포 | 무료~$7/월 | ✅ |
| **Railway** | Express 친화적, 결제 기반 (청구는 사용 후) | 종량제 | ✅ |
| **Fly.io** | 가볍고 빠름, 전 세계 배포 | 무료~$11/월 | - |
| **Heroku** | 한때 대세, 현재 유료화 (23년 11월) | $7/월 이상 | ❌ |

**권장**: Render 또는 Railway

---

## 6.2 Render 배포 (권장)

### 6.2.1 사전 준비

1. **GitHub 저장소 준비**
   - `apps/yunn-backend` 폴더를 GitHub에 푸시
   - `.env` 파일은 `.gitignore`에 포함되어 있는지 확인

2. **Render 계정 생성**
   - [render.com](https://render.com) 회원가입
   - GitHub 계정 연동

### 6.2.2 배포 단계

1. **Render Dashboard에서 "New +"**
   - "Web Service" 선택

2. **GitHub 저장소 연결**
   - 저장소 선택: `YUNN_App`
   - Branch: `master` (또는 배포할 브랜치)

3. **Build & Deploy 설정**
   - **Name**: `yunn-backend` (또는 원하는 이름)
   - **Environment**: `Node`
   - **Region**: `Singapore` (또는 가장 가까운 지역)
   - **Branch**: `master`

4. **Build Command & Start Command**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start` (또는 `node dist/server.js`)
   - **Root Directory**: `apps/yunn-backend` ← **중요**

5. **Environment Variables 설정**
   ```
   DATABASE_URL = postgresql://user:password@host:5432/yunn_prod
   PORT = 4000
   CORS_ORIGIN = https://yunn.vercel.app
   NODE_ENV = production
   ```

6. **Create Web Service**
   - 배포 시작
   - 로그에서 배포 상태 확인
   - 성공 시 `https://yunn-backend.onrender.com` 같은 URL 할당

### 6.2.3 배포 후 확인

```bash
# 배포된 API 테스트
curl https://yunn-backend.onrender.com/surveys \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "photoUploaded": false}'

# 응답이 200이고 success: true면 성공
```

### 6.2.4 자동 배포 설정 (선택)

GitHub에 `master` 브랜치로 푸시하면 자동으로 Render에 배포됩니다.
- Render Dashboard → Settings → Auto-Deploy 확인

### 6.2.5 문제 해결

**배포 실패 시**:
- Render Dashboard → Logs에서 에러 메시지 확인
- 일반적인 원인:
  - `DATABASE_URL` 잘못됨 → 다시 확인
  - Node 버전 불일치 → `package.json`의 `engines` 필드 확인
  - 빌드 실패 → 로컬에서 `npm run build` 실행해서 에러 확인

---

## 6.3 Railway 배포 (대안)

### 6.3.1 사전 준비

1. Railway 계정 생성: [railway.app](https://railway.app)
2. GitHub 연동

### 6.3.2 배포 단계

1. **Dashboard → New Project → GitHub Repo**
2. YUNN_App 저장소 선택
3. **Add Service → GitHub Repo**
4. **환경변수 설정**
   - Railway가 자동으로 감지하는 `DATABASE_URL` 설정
   - 추가: `CORS_ORIGIN`, `PORT`, `NODE_ENV`

5. **Deploy**
   - Railway가 자동으로 감지하고 배포
   - 배포 URL 확인

### 특징
- Render보다 빠른 배포
- 로그가 더 읽기 좋음
- 비용은 종량제 (매우 저렴)

---

## 6.4 PostgreSQL 프로덕션 DB

### 옵션 1: Render PostgreSQL (권장)

Render에서 Web Service와 함께 Database도 제공합니다.

**설정**:
1. Render Dashboard → Databases → Create
2. **Name**: `yunn-postgres`
3. PostgreSQL 인스턴스 생성 완료
4. **Internal Database URL** 복사
5. Web Service의 `DATABASE_URL` 환경변수에 설정

### 옵션 2: Supabase

Supabase는 PostgreSQL 호스팅 + auth/storage 기능도 포함합니다.

**설정**:
1. [supabase.com](https://supabase.com) → 프로젝트 생성
2. Connection String 복사
3. 환경변수에 설정

### 옵션 3: Railway PostgreSQL

Railway에서도 PostgreSQL 추가 가능합니다.

---

## 6.5 환경변수 최종 정리

### 로컬 개발 (`.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/yunn_dev
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 프로덕션 (Render/Railway 대시보드에서 설정)
```
DATABASE_URL=postgresql://[production-db-url]
PORT=4000
CORS_ORIGIN=https://yunn.vercel.app
NODE_ENV=production
```

**주의 사항**:
- `DATABASE_URL` 는 배포 후에만 할당됨
- 배포 전에는 로컬 테스트로 충분
- `.env` 파일은 **절대 커밋하지 않음**

---

## 6.6 프론트엔드 환경변수 설정

배포된 백엔드 URL을 프론트엔드에 알려줍니다.

### Vercel 배포

**Settings → Environment Variables**:
```
NEXT_PUBLIC_API_BASE_URL = https://yunn-backend.onrender.com
```

**또는 Preview/Production 환경별로 다르게 설정**:
- Preview (개발 브랜치): `http://localhost:4000`
- Production (main 브랜치): `https://yunn-backend.onrender.com`

---

## 6.7 E2E 테스트 (배포 후)

### 백엔드 헬스 체크

```bash
# 기본 연결 확인
curl https://yunn-backend.onrender.com/

# 설문 저장 테스트
curl -X POST https://yunn-backend.onrender.com/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_prod",
    "skinType": "Oily",
    "concerns": "Acne",
    "photoUploaded": false
  }'

# 설문 조회 테스트
curl https://yunn-backend.onrender.com/surveys/test_prod
```

### 프론트엔드 테스트

1. 프론트 로컬에서 환경변수 업데이트: `NEXT_PUBLIC_API_BASE_URL=https://yunn-backend.onrender.com`
2. 설문 완료 → API 호출 성공 확인
3. 루틴 체크 → 백그라운드 동기화 확인
4. 프론트 배포 후 실제 운영 환경에서 테스트

---

## 6.8 모니터링 (선택)

### 배포 후 감시할 항목

- **응답 시간**: Render/Railway 대시보드에서 확인
- **에러율**: 백엔드 로그 자동 수집
- **데이터베이스 상태**: PostgreSQL 연결 확인

### 추천 모니터링 도구 (심화)

- **Sentry**: 에러 추적
- **New Relic**: 성능 모니터링
- **Datadog**: 통합 모니터링

현재 스프린트에서는 Render/Railway의 기본 로깅으로 충분합니다.

---

## 6.9 배포 체크리스트

### 배포 전
- [ ] `.env.gitignore` 확인 (`.env` 커밋 안 됨)
- [ ] 로컬에서 `npm run build` 성공
- [ ] 로컬 테스트 (`npm test` 통과)
- [ ] Git에 푸시 (`master` 브랜치)

### Render 설정 시
- [ ] **Root Directory** = `apps/yunn-backend` 설정 (중요!)
- [ ] **Build Command** = `npm run build`
- [ ] **Start Command** = `npm start`
- [ ] **Environment Variables** 모두 입력
  - DATABASE_URL
  - CORS_ORIGIN (프론트 URL)
  - PORT, NODE_ENV

### 배포 후
- [ ] 배포 URL로 API 호출 테스트
- [ ] 설문 저장 → DB 저장 확인
- [ ] 루틴 조회/저장 테스트
- [ ] 프론트 환경변수 업데이트
- [ ] 프론트 배포 및 E2E 테스트

---

## 6.10 문제 해결

### "Build failed" 에러

**원인**: Node 버전 불일치 또는 패키지 설치 실패

**해결**:
1. Render 로그 확인: "Node version..."
2. `package.json`에 `engines` 필드 추가:
   ```json
   "engines": {
     "node": "18.x"
   }
   ```

### "Database connection failed" 에러

**원인**: DATABASE_URL 잘못됨

**해결**:
1. 배포 플랫폼 대시보드에서 Database 섹션 확인
2. Connection String 복사 (Internal이 아닌 Public URL 사용)
3. 환경변수 다시 설정

### "CORS error" (프론트에서)

**원인**: CORS_ORIGIN이 잘못되거나 설정되지 않음

**해결**:
1. 백엔드 환경변수 확인: `CORS_ORIGIN=https://yunn.vercel.app`
2. 프론트 API 호출이 백엔드 URL 사용하는지 확인
3. 백엔드 재배포

---

## 다음 단계

배포 완료 후:
1. 프론트엔드 팀과 API URL 공유
2. E2E 테스트 실행
3. 운영 환경 모니터링 시작
4. 심화 단계 (JWT 인증) 계획

---

## 참고 링크

- Render 문서: https://render.com/docs/deploy-node-express-app
- Railway 문서: https://docs.railway.app/
- Prisma 배포: https://www.prisma.io/docs/guides/deployment
