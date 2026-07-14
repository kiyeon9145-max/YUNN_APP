import type { Request, Response, NextFunction } from "express";
import { AppError, ServerError } from "../../../shared/errors/AppError.js";
import type { ErrorResponse } from "../../../shared/utils/response.js";

// Express 에러 핸들러 미들웨어
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
) {
  // AppError 인스턴스인 경우
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

  // 그 외 에러는 SERVER_ERROR로 처리
  const serverError = new ServerError();
  res.status(serverError.statusCode).json({
    success: false,
    error: {
      code: serverError.code,
      message: serverError.message,
    },
  });
}
