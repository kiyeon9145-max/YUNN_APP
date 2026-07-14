import { z } from "zod";

// sessionId 검증 (빈 문자열, 255자 이상 거부)
export const sessionIdSchema = z
  .string()
  .min(1, "sessionId는 빈 문자열일 수 없습니다")
  .max(255, "sessionId는 255자 이하여야 합니다");
