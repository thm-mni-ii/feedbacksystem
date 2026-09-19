import { Router } from "express";
import { Db } from "mongodb";
import { authenticateToken } from "../middleware/authenticateToken";
import { asyncHandler } from "../shared/http";
import { StudyConfigurationController } from "./studyConfiguration.controller";
import { StudyConfigurationRepository } from "./studyConfiguration.repository";

export function createStudyConfigurationRouter(db: Db): Router {
  const controller = new StudyConfigurationController(
    new StudyConfigurationRepository(db)
  );
  const router = Router();

  router.get(
    "/courses/:courseId/study-configuration",
    authenticateToken,
    asyncHandler(controller.get)
  );
  router.put(
    "/courses/:courseId/study-configuration",
    authenticateToken,
    asyncHandler(controller.update)
  );
  router.delete(
    "/courses/:courseId/study-configuration",
    authenticateToken,
    asyncHandler(controller.reset)
  );

  return router;
}
