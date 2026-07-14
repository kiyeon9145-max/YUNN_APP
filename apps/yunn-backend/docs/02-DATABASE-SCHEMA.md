# 2. 데이터베이스 설정

---

## 2.1 PostgreSQL 준비

### 옵션 1: 로컬 PostgreSQL (권장: 개발 속도)
```bash
# macOS Homebrew
brew install postgresql@15
brew services start postgresql@15

# 기본 포트: 5432
# 기본 사용자: postgres
```

### 옵션 2: Docker (권장: 팀 일관성)
```bash
docker run --name yunn-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yunn_dev \
  -p 5432:5432 \
  -d postgres:15
```

### 옵션 3: Supabase (클라우드)
- [supabase.com](https://supabase.com) 회원가입
- 프로젝트 생성 → Connection string 복사
- DATABASE_URL에 붙여넣기

---

## 2.2 Prisma 스키마 작성

**파일**: `prisma/schema.prisma`

```prisma
// 데이터베이스 설정
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Prisma Client 생성
generator client {
  provider = "prisma-client-js"
}

// ── 테이블 1: 설문 제출 ──────────────────────────────────────
model SurveySubmission {
  id                String   @id @default(cuid())
  sessionId         String   // yunn_session_id
  
  // 설문 입력값
  city              String?
  gender            String?
  age               String?
  skinType          String?
  concern           String?
  trigger           String[]  // Postgres text[]
  sensitivity       String?
  outdoor           String?
  sunscreen         String?
  sleep             String?
  stress            String?
  routineLevel      String?
  photoUploaded     Boolean  @default(false)
  
  // 계산 결과
  resultSkinType    String   // "Oily", "Dry", "Combination", "Normal"
  resultConcernType String   // "Acne", "Marks", "Pigmentation", "Tone"
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // 인덱스 (sessionId로 빠른 조회)
  @@index([sessionId])
}

// ── 테이블 2: 루틴 체크 ──────────────────────────────────────
model RoutineCheck {
  id        String   @id @default(cuid())
  sessionId String
  dateKey   String   // "YYYY-MM-DD" 형식
  
  // 각 날짜별 아침/저녁 스텝 체크 (4스텝씩)
  morning   Boolean[] @default([false, false, false, false])
  evening   Boolean[] @default([false, false, false, false])
  
  updatedAt DateTime @updatedAt

  // 유니크 제약: 한 세션의 한 날짜는 1개 row만
  @@unique([sessionId, dateKey])
}

// ── 심화 단계에서 추가 (인증) ────────────────────────────────
// model User {
//   id           String   @id @default(cuid())
//   email        String   @unique
//   nickname     String
//   passwordHash String
//   createdAt    DateTime @default(now())
// }
```

---

## 2.3 DBeaver 연결 설정

### DBeaver 다운로드
- [dbeaver.io](https://dbeaver.io) → Community Edition 다운로드
- 설치 후 실행

### PostgreSQL 연결 추가

1. **상단 메뉴**: Database → New Database Connection
2. **DB 선택**: PostgreSQL 선택 → Next
3. **연결 정보 입력**:
   ```
   Server Host: localhost
   Port: 5432
   Database: yunn_dev        (생성 필요 시 별도 쿼리)
   Username: postgres
   Password: (설정한 비밀번호)
   ```
4. **테스트**: "Test Connection" → Success 확인
5. **완료**: Finish

### DBeaver에서 DB 생성 (처음 한 번)
```sql
CREATE DATABASE yunn_dev
  WITH ENCODING 'UTF8';
```

---

## 2.4 Prisma 마이그레이션

### 마이그레이션 생성 및 실행
```bash
# 1. 초기 마이그레이션 생성
npx prisma migrate dev --name init

# 입력 프롬프트:
# ✔ Name of migration › init
# ✔ Applying migration `20260714000000_init`
```

**결과**:
- `prisma/migrations/` 폴더 생성
- PostgreSQL에 `SurveySubmission`, `RoutineCheck` 테이블 생성

### DBeaver에서 확인
```sql
-- DBeaver SQL 쿼리
SELECT * FROM "SurveySubmission";
SELECT * FROM "RoutineCheck";
```

---

## 2.5 Prisma Client 생성

```bash
npx prisma generate
```

**생성 파일**: `node_modules/.prisma/client`

---

## 2.6 데이터 접근 레이어 (Repository)

**파일**: `src/outbound/persistence/surveyRepository.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const SurveyRepository = {
  async create(data: {
    sessionId: string;
    city?: string;
    gender?: string;
    age?: string;
    skinType?: string;
    concern?: string;
    trigger?: string[];
    sensitivity?: string;
    outdoor?: string;
    sunscreen?: string;
    sleep?: string;
    stress?: string;
    routineLevel?: string;
    photoUploaded: boolean;
    resultSkinType: string;
    resultConcernType: string;
  }) {
    return prisma.surveySubmission.create({ data });
  },

  async findLatestBySessionId(sessionId: string) {
    return prisma.surveySubmission.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });
  },
};
```

**파일**: `src/outbound/persistence/routineRepository.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const RoutineRepository = {
  async findBySessionId(sessionId: string) {
    const checks = await prisma.routineCheck.findMany({
      where: { sessionId },
    });
    
    if (checks.length === 0) return null;

    // { dateKey: { morning, evening } } 형태로 변환
    return {
      startDate: checks[0].createdAt.toISOString().split('T')[0],
      checks: checks.reduce(
        (acc, check) => ({
          ...acc,
          [check.dateKey]: {
            morning: check.morning,
            evening: check.evening,
          },
        }),
        {}
      ),
    };
  },

  async upsert(sessionId: string, dateKey: string, data: {
    morning?: boolean[];
    evening?: boolean[];
  }) {
    return prisma.routineCheck.upsert({
      where: { sessionId_dateKey: { sessionId, dateKey } },
      update: data,
      create: {
        sessionId,
        dateKey,
        ...data,
      },
    });
  },
};
```

---

## 2.7 연결 테스트

**파일**: `src/lib/db.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Database Connection", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("데이터베이스에 연결되어야 한다", async () => {
    // PostgreSQL 버전 확인
    const version = await prisma.$queryRaw`SELECT version()`;
    expect(version).toBeDefined();
  });

  it("SurveySubmission 테이블이 존재해야 한다", async () => {
    // 테이블 존재 확인
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'SurveySubmission'
    `;
    expect(tables).toBeDefined();
  });
});
```

**테스트 실행**:
```bash
npm test -- src/lib/db.test.ts
```

---

## 2.8 마이그레이션 관리

### 마이그레이션 히스토리 확인
```bash
npx prisma migrate status
```

### 새 필드 추가 (나중에)
```bash
# schema.prisma 수정 후
npx prisma migrate dev --name add_new_field

# 생성된 SQL 파일: prisma/migrations/20260714_add_new_field/migration.sql
```

### 마이그레이션 초기화 (개발 중에만)
```bash
# ⚠️ 주의: 모든 데이터 삭제
npx prisma migrate reset
```

---

## 2.9 Prisma Studio (선택사항)

DB를 GUI로 관리하고 싶을 때:

```bash
npx prisma studio
# http://localhost:5555 자동 오픈
```

---

## 다음: API 스펙 정의

**다음**: [03-API-SPECS.md](./03-API-SPECS.md) - 4개 API의 상세 요청/응답 정의
