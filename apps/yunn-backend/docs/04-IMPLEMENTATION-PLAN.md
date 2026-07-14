# 4. 구현 계획 (TDD)

---

## 개요

**TDD (Test-Driven Development)** 방식으로 구현합니다:
1. 테스트 먼저 작성 (실패)
2. zod 스키마 정의
3. 최소한의 구현 (테스트 통과)
4. 리팩터 (필요시)

---

## Phase 1: 기초 설정 (1일)

### 1.1 에러 핸들링 클래스

**파일**: `src/shared/errors/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(public fieldErrors: Record<string, string[]>) {
    super("VALIDATION_ERROR", "입력값이 유효하지 않습니다", 400, {
      fieldErrors,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super("NOT_FOUND", message, 404);
  }
}

export class ServerError extends AppError {
  constructor(message: string = "일시적 오류입니다. 다시 시도해주세요") {
    super("SERVER_ERROR", message, 500);
  }
}
```

### 1.2 에러 핸들러 미들웨어

**파일**: `src/inbound/http/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "SERVER_ERROR",
      message: "일시적 오류입니다. 다시 시도해주세요",
    },
  });
};
```

### 1.3 성공 응답 유틸

**파일**: `src/shared/utils/response.ts`

```typescript
import { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}
```

### 1.4 app.ts 업데이트

**파일**: `src/app.ts`

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./inbound/http/middleware/errorHandler";

dotenv.config();

export const app = express();

// 미들웨어
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

// 라우터 (Phase 2에서 추가)
// app.use("/surveys", surveyRouter);
// app.use("/routine", routineRouter);

// 에러 핸들러 (반드시 마지막)
app.use(errorHandler);
```

---

## Phase 2: 설문 API (2-3일)

### 2.1 zod 스키마

**파일**: `src/shared/schemas/surveys.ts`

```typescript
import { z } from "zod";

export const SurveySubmitSchema = z.object({
  sessionId: z.string().min(1, "sessionId는 필수입니다"),
  
  city: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  age: z.enum(["18-24", "25-34", "35-44", "45-54", "55+"]).optional(),
  skinType: z
    .enum(["Oily", "Dry", "Combination", "Normal"])
    .optional()
    .refine((val) => !val || val in ["Oily", "Dry", "Combination", "Normal"]),
  concerns: z.string().optional(),
  trigger: z.array(z.string()).optional(),
  sensitivity: z.enum(["Normal", "Sensitive", "Very sensitive"]).optional(),
  outdoor: z.enum(["Under 1h", "1-2h", "2-3h", "3h+"]).optional(),
  sunscreen: z
    .enum(["Always", "Sometimes", "Rarely", "Never"])
    .optional(),
  sleep: z
    .enum(["Under 5h", "5-6h", "6-7h", "7-8h", "8h+"])
    .optional(),
  stress: z.enum(["Low", "Medium", "High", "Very high"]).optional(),
  routineLevel: z
    .enum(["Beginner", "Intermediate", "Advanced"])
    .optional(),
  photoUploaded: z.boolean().default(false),
});

export type SurveySubmitInput = z.infer<typeof SurveySubmitSchema>;
```

### 2.2 유틸 함수: toConcernKey

**파일**: `src/shared/utils/normalize.ts`

```typescript
// 프론트 result-data.ts의 toConcernKey() 포팅
export function toConcernKey(concern: string | undefined): string {
  if (concern === "Uneven skin tone") return "Tone";
  if (concern === "Acne marks") return "Marks";
  return concern || "Acne";
}
```

### 2.3 설문 저장 로직

**파일**: `src/application/surveys/submitSurvey.ts`

```typescript
import { SurveyRepository } from "@/outbound/persistence/surveyRepository";
import { toConcernKey } from "@/shared/utils/normalize";
import type { SurveySubmitInput } from "@/shared/schemas/surveys";

export async function submitSurvey(input: SurveySubmitInput) {
  const resultSkinType = input.skinType || "Oily";
  const resultConcernType = toConcernKey(input.concerns);

  const saved = await SurveyRepository.create({
    sessionId: input.sessionId,
    city: input.city,
    gender: input.gender,
    age: input.age,
    skinType: input.skinType,
    concern: input.concerns,
    trigger: input.trigger || [],
    sensitivity: input.sensitivity,
    outdoor: input.outdoor,
    sunscreen: input.sunscreen,
    sleep: input.sleep,
    stress: input.stress,
    routineLevel: input.routineLevel,
    photoUploaded: input.photoUploaded,
    resultSkinType,
    resultConcernType,
  });

  return {
    resultSkinType,
    resultConcernType,
    sessionId: input.sessionId,
    createdAt: saved.createdAt.toISOString(),
  };
}
```

### 2.4 설문 조회 로직

**파일**: `src/application/surveys/getSurvey.ts`

```typescript
import { SurveyRepository } from "@/outbound/persistence/surveyRepository";
import { NotFoundError } from "@/shared/errors/AppError";

export async function getSurvey(sessionId: string) {
  const survey = await SurveyRepository.findLatestBySessionId(sessionId);

  if (!survey) {
    throw new NotFoundError("진단 결과를 찾을 수 없습니다");
  }

  return {
    skinType: survey.skinType,
    concernType: survey.resultConcernType,
    gender: survey.gender,
    age: survey.age,
    city: survey.city,
    createdAt: survey.createdAt.toISOString(),
  };
}
```

### 2.5 라우터

**파일**: `src/inbound/http/routes/surveys.ts`

```typescript
import { Router, Request, Response, NextFunction } from "express";
import { SurveySubmitSchema } from "@/shared/schemas/surveys";
import { ValidationError } from "@/shared/errors/AppError";
import { submitSurvey } from "@/application/surveys/submitSurvey";
import { getSurvey } from "@/application/surveys/getSurvey";
import { sendSuccess } from "@/shared/utils/response";

export const surveyRouter = Router();

// POST /surveys
surveyRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = SurveySubmitSchema.safeParse(req.body);

      if (!result.success) {
        const fieldErrors = Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors || {}).map(
            ([key, errors]) => [key, errors ?? []],
          ),
        );
        throw new ValidationError(fieldErrors);
      }

      const data = await submitSurvey(result.data);
      sendSuccess(res, data, 200);
    } catch (err) {
      next(err);
    }
  },
);

// GET /surveys/:sessionId
surveyRouter.get(
  "/:sessionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getSurvey(req.params.sessionId);
      sendSuccess(res, data, 200);
    } catch (err) {
      next(err);
    }
  },
);
```

### 2.6 테스트

**파일**: `src/inbound/http/routes/surveys.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("POST /surveys", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.surveySubmission.deleteMany({});
    await prisma.$disconnect();
  });

  it("필수값 누락 시 400 VALIDATION_ERROR를 반환한다", async () => {
    const res = await request(app).post("/surveys").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.fieldErrors.sessionId).toBeDefined();
  });

  it("유효한 설문을 저장하고 결과를 반환한다", async () => {
    const res = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_123",
        city: "Delhi",
        gender: "Female",
        age: "25-34",
        skinType: "Oily",
        concerns: "Acne",
        photoUploaded: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resultSkinType).toBe("Oily");
    expect(res.body.data.resultConcernType).toBe("Acne");
  });

  it("'Uneven skin tone' → 'Tone'로 정규화한다", async () => {
    const res = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_tone",
        concerns: "Uneven skin tone",
        photoUploaded: false,
      });

    expect(res.body.data.resultConcernType).toBe("Tone");
  });

  it("'Acne marks' → 'Marks'로 정규화한다", async () => {
    const res = await request(app)
      .post("/surveys")
      .send({
        sessionId: "test_session_marks",
        concerns: "Acne marks",
        photoUploaded: false,
      });

    expect(res.body.data.resultConcernType).toBe("Marks");
  });
});

describe("GET /surveys/:sessionId", () => {
  beforeAll(async () => {
    await prisma.$connect();
    // 테스트용 데이터 생성
    await prisma.surveySubmission.create({
      data: {
        sessionId: "test_get_session",
        skinType: "Dry",
        resultSkinType: "Dry",
        resultConcernType: "Pigmentation",
        photoUploaded: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.surveySubmission.deleteMany({});
    await prisma.$disconnect();
  });

  it("존재하는 sessionId의 설문을 조회한다", async () => {
    const res = await request(app).get("/surveys/test_get_session");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skinType).toBe("Dry");
    expect(res.body.data.concernType).toBe("Pigmentation");
  });

  it("존재하지 않는 sessionId는 404를 반환한다", async () => {
    const res = await request(app).get("/surveys/nonexistent_session");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
```

### 2.7 실행

```bash
# 테스트 실행
npm test -- src/inbound/http/routes/surveys.test.ts

# 개발 서버 실행
npm run dev

# 수동 테스트
curl -X POST http://localhost:4000/surveys \
  -H "Content-Type: application/json" \
  -d '{ "sessionId": "test", "concerns": "Acne", "photoUploaded": false }'
```

---

## Phase 3: 루틴 API (2일)

### 3.1 zod 스키마

**파일**: `src/shared/schemas/routine.ts`

```typescript
import { z } from "zod";

// 날짜 검증: YYYY-MM-DD
const DateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다");

export const RoutineGetSchema = z.object({
  sessionId: z.string().min(1),
});

export const RoutineUpdateSchema = z.object({
  sessionId: z.string().min(1),
  dateKey: DateKeySchema,
  morning: z.array(z.boolean()).length(4, "아침 체크는 정확히 4개여야 합니다"),
  evening: z.array(z.boolean()).length(4, "저녁 체크는 정확히 4개여야 합니다"),
});

export type RoutineGetInput = z.infer<typeof RoutineGetSchema>;
export type RoutineUpdateInput = z.infer<typeof RoutineUpdateSchema>;
```

### 3.2 루틴 로직

**파일**: `src/application/routine/getRoutine.ts`

```typescript
import { RoutineRepository } from "@/outbound/persistence/routineRepository";
import { NotFoundError } from "@/shared/errors/AppError";

export async function getRoutine(sessionId: string) {
  const routine = await RoutineRepository.findBySessionId(sessionId);

  if (!routine) {
    throw new NotFoundError("루틴을 시작하지 않았습니다");
  }

  return routine;
}
```

**파일**: `src/application/routine/updateRoutine.ts`

```typescript
import { RoutineRepository } from "@/outbound/persistence/routineRepository";
import type { RoutineUpdateInput } from "@/shared/schemas/routine";

export async function updateRoutine(input: RoutineUpdateInput) {
  const result = await RoutineRepository.upsert(
    input.sessionId,
    input.dateKey,
    {
      morning: input.morning,
      evening: input.evening,
    },
  );

  return {
    dateKey: result.dateKey,
    morning: result.morning,
    evening: result.evening,
  };
}
```

### 3.3 라우터

**파일**: `src/inbound/http/routes/routine.ts`

```typescript
import { Router, Request, Response, NextFunction } from "express";
import { RoutineUpdateSchema, RoutineGetSchema } from "@/shared/schemas/routine";
import { ValidationError } from "@/shared/errors/AppError";
import { getRoutine } from "@/application/routine/getRoutine";
import { updateRoutine } from "@/application/routine/updateRoutine";
import { sendSuccess } from "@/shared/utils/response";

export const routineRouter = Router();

// GET /routine/:sessionId
routineRouter.get(
  "/:sessionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = RoutineGetSchema.safeParse({
        sessionId: req.params.sessionId,
      });

      if (!result.success) {
        const fieldErrors = Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors || {}).map(
            ([key, errors]) => [key, errors ?? []],
          ),
        );
        throw new ValidationError(fieldErrors);
      }

      const data = await getRoutine(result.data.sessionId);
      sendSuccess(res, data, 200);
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /routine/:sessionId
routineRouter.patch(
  "/:sessionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = RoutineUpdateSchema.safeParse({
        sessionId: req.params.sessionId,
        ...req.body,
      });

      if (!result.success) {
        const fieldErrors = Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors || {}).map(
            ([key, errors]) => [key, errors ?? []],
          ),
        );
        throw new ValidationError(fieldErrors);
      }

      const data = await updateRoutine(result.data);
      sendSuccess(res, data, 200);
    } catch (err) {
      next(err);
    }
  },
);
```

### 3.4 테스트

**파일**: `src/inbound/http/routes/routine.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("GET /routine/:sessionId", () => {
  beforeAll(async () => {
    await prisma.$connect();
    // 테스트 데이터
    await prisma.routineCheck.create({
      data: {
        sessionId: "test_routine_session",
        dateKey: "2026-07-14",
        morning: [true, false, true, false],
        evening: [true, true, false, false],
      },
    });
  });

  afterAll(async () => {
    await prisma.routineCheck.deleteMany({});
    await prisma.$disconnect();
  });

  it("루틴 데이터가 존재하면 조회한다", async () => {
    const res = await request(app).get("/routine/test_routine_session");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checks["2026-07-14"]).toBeDefined();
  });

  it("루틴이 없으면 404를 반환한다", async () => {
    const res = await request(app).get("/routine/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("PATCH /routine/:sessionId", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.routineCheck.deleteMany({});
    await prisma.$disconnect();
  });

  it("새로운 날짜 체크를 생성한다", async () => {
    const res = await request(app)
      .patch("/routine/test_patch_session")
      .send({
        dateKey: "2026-07-15",
        morning: [true, true, false, true],
        evening: [false, false, true, false],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dateKey).toBe("2026-07-15");
  });

  it("날짜 형식이 잘못되면 400을 반환한다", async () => {
    const res = await request(app)
      .patch("/routine/test_session")
      .send({
        dateKey: "07-14-2026",
        morning: [true, false, true, false],
        evening: [true, true, false, false],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
```

---

## Phase 4: 앱 통합

### 4.1 app.ts 최종 업데이트

**파일**: `src/app.ts`

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { surveyRouter } from "./inbound/http/routes/surveys";
import { routineRouter } from "./inbound/http/routes/routine";
import { errorHandler } from "./inbound/http/middleware/errorHandler";

dotenv.config();

export const app = express();

// 미들웨어
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

// 라우터
app.use("/surveys", surveyRouter);
app.use("/routine", routineRouter);

// 에러 핸들러
app.use(errorHandler);
```

### 4.2 전체 테스트 실행

```bash
npm test
```

---

## 다음 단계

- 프론트 연동: [05-FRONTEND-CHANGES.md](./05-FRONTEND-CHANGES.md)
- 배포: [06-DEPLOYMENT.md](./06-DEPLOYMENT.md)
