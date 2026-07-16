import { z } from "zod";

export const SurveySubmitSchema = z.object({
  sessionId: z.string().min(1, "필수 입력값입니다"),
  city: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  age: z.string().optional(),
  skinType: z
    .enum(["Oily", "Dry", "Combination", "Normal"])
    .optional(),
  concerns: z.string().optional(),
  trigger: z.array(z.string()).optional(),
  sensitivity: z
    .enum(["Rarely", "Sometimes", "Easily", "Very sensitive"])
    .optional(),
  outdoor: z.string().optional(),
  sunscreen: z
    .enum(["Every day", "Most days", "Occasionally", "Rarely"])
    .optional(),
  sleep: z.string().optional(),
  stress: z
    .enum(["Low", "Medium", "High", "Very high"])
    .optional(),
  routineLevel: z
    .enum(["Nothing", "Wash only", "Basic", "Multi"])
    .optional(),
  photoUploaded: z.boolean(),
});

export type SurveySubmitRequest = z.infer<typeof SurveySubmitSchema>;

export const SurveySubmitResponseSchema = z.object({
  resultSkinType: z.string().nullable(),
  resultConcernType: z.string().nullable(),
  sessionId: z.string(),
  createdAt: z.string(),
});

export type SurveySubmitResponse = z.infer<typeof SurveySubmitResponseSchema>;

export const SurveyGetResponseSchema = z.object({
  skinType: z.string().nullable(),
  concernType: z.string().nullable(),
  gender: z.string().nullable(),
  age: z.string().nullable(),
  city: z.string().nullable(),
  photoUploaded: z.boolean(),
  createdAt: z.string(),
});

export type SurveyGetResponse = z.infer<typeof SurveyGetResponseSchema>;
