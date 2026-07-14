# 1. 초기 환경 설정

---

## 1.1 프로젝트 구조 확인

현재 백엔드는 `apps/yunn-backend` 폴더에 있습니다.

```bash
cd /Users/apple/Desktop/YUNN_App/apps/yunn-backend
```

### 파일 트리
```
yunn-backend/
├── docs/                  # 이 문서들
├── prisma/               
│   └── schema.prisma      # Prisma 스키마 (데이터 모델)
├── src/
│   ├── inbound/           # HTTP 라우터 & 미들웨어
│   ├── application/       # 비즈니스 로직
│   ├── outbound/          # DB 접근 레이어
│   ├── shared/            # zod 스키마, 타입, 에러 클래스
│   ├── app.ts             # Express 앱 인스턴스 (테스트용)
│   └── server.ts          # 서버 시작 진입점
├── .env                   # 환경변수 (로컬)
├── package.json
├── tsconfig.json
└── vitest.config.ts       # 테스트 설정
```

---

## 1.2 패키지 설치 확인

필요한 패키지:

```bash
npm list express cors zod prisma vitest supertest
```

**설치해야 할 것** (이미 설치된 경우 SKIP):

```bash
npm install express cors dotenv
npm install -D @types/express @types/cors
npm install -D prisma @prisma/client
npm install -D zod
npm install -D vitest supertest @types/supertest
npm install -D ts-node @types/node
```

### package.json 확인
```json
최신 버전 사용할 것.
```

---

## 1.3 환경변수 설정

### `.env` 파일 생성 (로컬 개발용)

**파일**: `apps/yunn-backend/.env`

```bash
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/yunn_dev"

# 포트
PORT=4000

# CORS (프론트엔드 도메인)
CORS_ORIGIN="http://localhost:3000"

# 환경
NODE_ENV="development"
```

### `.env.production` (배포용, 나중에)
```bash
DATABASE_URL="postgresql://..."  # Render/Railway 프로비저닝 URL
PORT=4000
CORS_ORIGIN="https://yunn.vercel.app"
NODE_ENV="production"
```

**⚠️ .env는 절대 커밋하지 마세요.**

---

## 1.4 TypeScript 설정 확인

**파일**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 1.5 Express 앱 초기화

**파일**: `src/app.ts` (테스트용 - 서버 시작 X)
// 테스트에서는 app만 import한다.
// server.ts는 listen만 담당한다.

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

// 미들웨어
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// 라우터 (나중에 추가)
// app.use("/surveys", surveyRouter);
// app.use("/routine", routineRouter);

// 에러 핸들러 (나중에 추가)
// app.use(errorHandler);
```

**파일**: `src/server.ts` (실제 서버 시작)

```typescript
import { app } from "./app.js";

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
```

---

## 1.6 실행 확인

### 개발 서버 실행
```bash
npm run dev
```

**기대 출력**:
```
🚀 Server running at http://localhost:4000
```

### curl로 확인
```bash
curl http://localhost:4000
# 404 Not Found (라우터가 없으므로 정상)
```

---

## 1.7 Prisma 초기화

**Prisma 프로젝트 생성** (이미 되어있으면 SKIP):

```bash
npx prisma init
```

**생성된 파일**:
- `prisma/schema.prisma` - 데이터 모델 정의
- `.env` - DATABASE_URL 변수

**다음**: [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md)에서 DB 연결 설정
