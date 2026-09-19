import { Db } from "mongodb";
import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { asyncHandler } from "../shared/http";
import { SessionController } from "./session.controller";
import { SessionRepository } from "./session.repository";
import { QuestionAttemptController } from "./questionAttempt.controller";
import { QuestionAttemptRepository } from "./questionAttempt.repository";
import { StudyConfigurationRepository } from "../studyConfiguration/studyConfiguration.repository";

export function createSessionRouter(db: Db): Router {
  const sessionRepository = new SessionRepository(db);
  const sessionController = new SessionController(
    sessionRepository,
    new StudyConfigurationRepository(db)
  );
  const attemptController = new QuestionAttemptController(
    new QuestionAttemptRepository(db),
    sessionRepository
  );
  const router = Router();

  router.get("/sessions", authenticateToken, asyncHandler(sessionController.listByStudent));
  router.get("/sessions/:id", authenticateToken, asyncHandler(sessionController.getById));
  router.post("/sessions", authenticateToken, asyncHandler(sessionController.create));
  router.put("/sessions/:id", authenticateToken, asyncHandler(sessionController.replace));

  router.post(
    "/sessions/:id/attempts",
    authenticateToken,
    asyncHandler(attemptController.create)
  );
  router.get(
    "/sessions/:id/attempts",
    authenticateToken,
    asyncHandler(attemptController.listBySession)
  );

  return router;
}
