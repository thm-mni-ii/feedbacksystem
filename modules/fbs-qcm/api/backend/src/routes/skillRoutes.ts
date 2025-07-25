import { Router } from "express";
import { authenticateToken } from "../authenticateToken";
import {
  deleteQuestionFromSkill,
  deleteSkill,
  editSkill,
  endLearnSession,
  getLearnSessionQuestion,
  getSkill,
  postLearnSession,
  postSkill,
  putLearnSessionSettings,
  putQuestionToSkill,
  getSkillsForCourse,
  getSkillProgressForCourse,
} from "../controller/skill";

const router = Router();

router.put(
  "/api_v1/addQuestionToSkill/:skillId/:questionId",
  authenticateToken,
  putQuestionToSkill
);
router.delete(
  "/api_v1/removeQuestionFromSkill/:skillId/:questionId",
  authenticateToken,
  deleteQuestionFromSkill
);
router.post("/api_v1/createSkill/", authenticateToken, postSkill);
router.put("/api_v1/skill/:skillId", authenticateToken, editSkill);
router.delete("/api_v1/deleteSkill/:skillId", authenticateToken, deleteSkill);
router.get(
  "/api_v1/getLearnSessionQuestion/:learnSessionId",
  authenticateToken,
  getLearnSessionQuestion
);
router.get("/api_v1/getSkill/:skillId", authenticateToken, getSkill);
router.put(
  "/api_v1/editLearnSessionSettings/:learnSessionId",
  authenticateToken,
  putLearnSessionSettings
);
router.post("/api_v1/startLearnSession", authenticateToken, postLearnSession);
router.put(
  "/api_v1/stopLearnSession/:learnSessionId",
  authenticateToken,
  endLearnSession
);
router.get(
  "/api_v1/courseSkills/:courseId",
  authenticateToken,
  getSkillsForCourse
);
router.get(
  "/api_v1/skillProgress/:courseId",
  authenticateToken,
  getSkillProgressForCourse
);

export default router;
