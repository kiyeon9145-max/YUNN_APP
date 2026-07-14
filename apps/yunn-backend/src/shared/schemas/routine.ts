import { z } from "zod";

// 날짜 형식 검증 (YYYY-MM-DD)
const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다");

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
