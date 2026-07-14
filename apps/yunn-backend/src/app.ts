import express from "express";
import cors from "cors";
import { errorHandler } from "./inbound/http/middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // 미들웨어
  app.use(cors());
  app.use(express.json());

  // 헬스 체크 (임시)
  app.get("/health", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  // 에러 핸들러 (마지막에 등록)
  app.use(errorHandler);

  return app;
}
