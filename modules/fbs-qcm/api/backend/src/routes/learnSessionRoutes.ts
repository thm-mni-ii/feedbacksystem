import express from "express";
import {
  startLearnSession,
  getCurrentLearnQuestion,
  submitLearnAnswer,
  endLearnSession,
} from "../controller/learnSession";
import { authenticateToken } from "../authenticateToken";

const router = express.Router();

router.post("/api_v1/startLearnSession", authenticateToken, startLearnSession);
router.get(
  "/api_v1/currentLearnQuestion/:sessionId",
  authenticateToken,
  getCurrentLearnQuestion
);
router.post(
  "/api_v1/submitLearnAnswer/:sessionId",
  authenticateToken,
  submitLearnAnswer
);
router.put(
  "/api_v1/endLearnSession/:sessionId",
  authenticateToken,
  endLearnSession
);

export default router;
