import { Db } from "mongodb";
import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { asyncHandler } from "../shared/http";
import { CompetencyController } from "./competency.controller";
import { CompetencyRepository } from "./competency.repository";

export function createCompetencyRouter(db: Db): Router {
  const controller = new CompetencyController(new CompetencyRepository(db));
  const router = Router();

  router.get("/competencies", authenticateToken, asyncHandler(controller.list));
  router.get("/competencies/:id", authenticateToken, asyncHandler(controller.getById));
  router.post("/competencies", authenticateToken, asyncHandler(controller.create));
  router.put("/competencies/:id", authenticateToken, asyncHandler(controller.update));
  router.delete("/competencies/:id", authenticateToken, asyncHandler(controller.remove));

  return router;
}
