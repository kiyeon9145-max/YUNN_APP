import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { SurveySubmitSchema } from "../../../shared/schemas/surveys.js";
import { sessionIdSchema } from "../../../shared/schemas/common.js";
import { submitSurvey } from "../../../application/surveys/submitSurvey.js";
import { getSurvey } from "../../../application/surveys/getSurvey.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { ValidationError } from "../../../shared/errors/AppError.js";

const router = Router();

// POST /surveys - 설문 저장
router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 입력값 검증
      const parseResult = SurveySubmitSchema.safeParse(req.body);
      if (!parseResult.success) {
        const fieldErrors = parseResult.error.flatten().fieldErrors;
        throw new ValidationError(fieldErrors as Record<string, string[]>);
      }

      // 설문 저장 및 결과 계산
      const result = await submitSurvey(parseResult.data);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /surveys/:sessionId - 설문 결과 조회
router.get(
  "/:sessionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // sessionId 검증
      const sessionIdValidation = sessionIdSchema.safeParse(
        req.params.sessionId
      );
      if (!sessionIdValidation.success) {
        const fieldErrors = { sessionId: [sessionIdValidation.error.message] };
        throw new ValidationError(fieldErrors);
      }

      const sessionId = sessionIdValidation.data;
      const result = await getSurvey(sessionId);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
