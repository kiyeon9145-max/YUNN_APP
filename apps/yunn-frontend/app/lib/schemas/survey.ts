import { z } from "zod";

// 허용된 이메일 도메인 (SurveyAnswer.js ALLOWED_INDIAN_EMAIL_DOMAINS)
const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "yahoo.in",
  "hotmail.com",
  "rediffmail.com",
  "icloud.com",
]);

// 도메인만 검증하는 함수 (z.email()으로 기본 형식은 이미 검증됨)
function isAllowedEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split("@")[1];
  return domain ? ALLOWED_EMAIL_DOMAINS.has(domain) : false;
}

// 전화번호 검증 (인도 번호: 6-9로 시작, 10자리)
const PhoneRegex = /^[6-9]\d{9}$/;

// 이름/이메일/전화 입력 스키마
export const UserInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .refine(isAllowedEmailDomain, "Email domain not supported"),
  phone: z.string().regex(PhoneRegex, "Invalid Indian phone number"),
});

// 설문 답변 스키마
export const SurveyAnswersSchema = z.object({
  name: z.string().min(2).optional(),
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .refine(isAllowedEmailDomain, "Invalid email or unsupported domain")
    .optional(),
  phone: z.string().regex(PhoneRegex, "Invalid Indian phone number").optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
  age: z.string().optional(),
  skinType: z.string().optional(),
  skinHelperCleanse: z.string().optional(),
  skinHelperAfterHours: z.string().optional(),
  skinHelperDay: z.string().optional(),
  skinHelperTexture: z.string().optional(),
  concerns: z.string().optional(),
  trigger: z.array(z.string()).optional(),
  sensitivity: z.string().optional(),
  outdoor: z.string().optional(),
  sunscreen: z.string().optional(),
  sleep: z.string().optional(),
  stress: z.string().optional(),
  routineLevel: z.string().optional(),
  photoDataUrl: z.string().optional(),
});

export type ValidatedSurveyAnswers = z.infer<typeof SurveyAnswersSchema>;

// Google Sheets 전송용 페이로드 스키마 (유연한 구조)
export const SurveySheetPayloadSchema = z.record(z.string(), z.any());

export type ValidatedSheetPayload = z.infer<typeof SurveySheetPayloadSchema>;
