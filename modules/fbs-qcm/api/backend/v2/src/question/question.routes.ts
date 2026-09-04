import { Db } from "mongodb";
import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { asyncHandler } from "../shared/http";
import { QuestionController } from "./question.controller";
import { QuestionRepository } from "./question.repository";

/**
 * Baut den Question-Router mit einer konkreten DB-Instanz auf.
 * Als Funktion statt Modul-Singleton, damit Tests eine eigene (In-Memory-)DB
 * durchreichen können, ohne Modul-Caching/Globals zu umgehen.
 */
export function createQuestionRouter(db: Db): Router {
  const controller = new QuestionController(new QuestionRepository(db));
  const router = Router();

  router.get("/questions", authenticateToken, asyncHandler(controller.list));
  router.get("/questions/:id", authenticateToken, asyncHandler(controller.getById));
  router.post("/questions", authenticateToken, asyncHandler(controller.create));
  router.put("/questions/:id", authenticateToken, asyncHandler(controller.update));
  router.delete("/questions/:id", authenticateToken, asyncHandler(controller.remove));

  return router;
}
