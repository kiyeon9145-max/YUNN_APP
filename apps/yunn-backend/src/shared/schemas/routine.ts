import { z } from "zod";

// 날짜 형식 및 유효성 검증 (YYYY-MM-DD)
const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다")
  .refine(
    (dateStr) => {
      // 날짜 유효성 검사 (2026-02-30, 2026-13-01 등 거부)
      const date = new Date(dateStr + "T00:00:00Z");
      if (isNaN(date.getTime())) {
        return false;
      }
      // 파싱된 날짜가 원본 문자열과 일치하는지 확인 (윤년 등)
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;
      return formatted === dateStr;
    },
    "유효하지 않은 날짜입니다"
  );

// 체크 배열 검증 (정확히 4개 boolean)
const checkArraySchema = z
  .array(z.boolean())
  .length(4, "정확히 4개 요소여야 합니다");

export const RoutineUpdateSchema = z.object({
  dateKey: dateKeySchema,
  morning: checkArraySchema,
  evening: checkArraySchema,
});

export type RoutineUpdateRequest = z.infer<typeof RoutineUpdateSchema>;

export const RoutineUpdateResponseSchema = z.object({
  dateKey: z.string(),
  morning: z.array(z.boolean()),
  evening: z.array(z.boolean()),
});

export type RoutineUpdateResponse = z.infer<
  typeof RoutineUpdateResponseSchema
>;

export const RoutineGetResponseSchema = z.object({
  startDate: z.string(),
  checks: z.record(
    z.string(),
    z.object({
      morning: z.array(z.boolean()),
      evening: z.array(z.boolean()),
    })
  ),
});

export type RoutineGetResponse = z.infer<typeof RoutineGetResponseSchema>;
