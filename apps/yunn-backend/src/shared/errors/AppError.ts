// 기본 앱 에러 클래스
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

// 입력값 검증 실패
export class ValidationError extends AppError {
  constructor(fieldErrors: Record<string, string[]>) {
    super(
      "VALIDATION_ERROR",
      "입력값이 유효하지 않습니다",
      400,
      { fieldErrors }
    );
    this.name = "ValidationError";
  }
}

// 데이터 없음
export class NotFoundError extends AppError {
  constructor(message: string = "요청한 리소스를 찾을 수 없습니다") {
    super("NOT_FOUND", message, 404);
    this.name = "NotFoundError";
  }
}

// 예기치 못한 에러
export class ServerError extends AppError {
  constructor(message: string = "일시적 오류입니다. 다시 시도해주세요") {
    super("SERVER_ERROR", message, 500);
    this.name = "ServerError";
  }
}
