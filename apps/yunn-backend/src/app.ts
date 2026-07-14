import express from "express";
import cors from "cors";
import { errorHandler } from "./inbound/http/middleware/errorHandler.js";
import surveyRouter from "./inbound/http/routes/surveys.js";
import routineRouter from "./inbound/http/routes/routine.js";

export function createApp() {
  const app = express();

  // 미들웨어
  app.use(cors());
  app.use(express.json());

  // 헬스 체크
  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  // 라우터
  app.use("/surveys", surveyRouter);
  app.use("/routine", routineRouter);

  // 에러 핸들러 (마지막에 등록)
  app.use(errorHandler);

  return app;
}
