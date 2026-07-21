import type { Request, Response, NextFunction } from "express";
import { AppError, ServerError } from "../../../shared/errors/AppError.js";
import type { ErrorResponse } from "../../../shared/utils/response.js";

// Prisma 에러 판단
function isPrismaKnownRequestError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "meta" in err &&
    typeof (err as Record<string, unknown>).code === "string"
  );
}

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

  // 그 외 에러: 로깅 + 개발 환경에서는 실제 메시지 반환
  console.error("[errorHandler] Unexpected error:");
  console.error(err);
  if (err instanceof Error) {
    console.error("Stack trace:", err.stack);
  }

  if (isPrismaKnownRequestError(err)) {
    const prismaErr = err as Record<string, unknown>;
    console.error("Prisma error code:", prismaErr.code);
    console.error("Prisma error meta:", prismaErr.meta);
  }

  const serverError = new ServerError();
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(serverError.statusCode).json({
    success: false,
    error: {
      code: serverError.code,
      message: isDevelopment
        ? (err instanceof Error ? err.message : String(err))
        : serverError.message,
    },
  });
}
