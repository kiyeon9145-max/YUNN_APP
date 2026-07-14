import type { Response } from "express";

// 성공 응답을 전송합니다.
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200) {
  res.status(statusCode).json({ success: true, data });
}

// 에러 응답 형식
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
