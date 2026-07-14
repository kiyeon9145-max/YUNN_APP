import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { RoutineUpdateSchema } from "../../../shared/schemas/routine.js";
import { sessionIdSchema } from "../../../shared/schemas/common.js";
import { updateRoutine } from "../../../application/routine/updateRoutine.js";
import { getRoutine } from "../../../application/routine/getRoutine.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { ValidationError } from "../../../shared/errors/AppError.js";

const router = Router();

// PATCH /routine/:sessionId - 루틴 체크 저장/업데이트
router.patch(
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

      // 입력값 검증
      const parseResult = RoutineUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        const fieldErrors = parseResult.error.flatten().fieldErrors;
        throw new ValidationError(fieldErrors as Record<string, string[]>);
      }

      // 루틴 저장/업데이트
      const sessionId = sessionIdValidation.data;
      const result = await updateRoutine(sessionId, parseResult.data);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /routine/:sessionId - 루틴 조회
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
      const result = await getRoutine(sessionId);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
