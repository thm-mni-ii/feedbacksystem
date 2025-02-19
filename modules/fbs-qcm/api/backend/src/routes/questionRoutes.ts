import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { allQuestions, copyQuestion, copyQuestionToCatalog, deleteQuestion, deleteQuestionFromCatalog, getAllquestionsInCatalog, getAllquestionsInCourse, getQuestion, postQuestion, postQuestionToCatalog, putQuestion } from '../controller/question';

const router = Router();

router.get("/api_v1/question/:id", authenticateToken, getQuestion);
router.delete("/api_v1/question/:id", authenticateToken, deleteQuestion);
router.put("/api_v1/question/", authenticateToken, putQuestion);
router.post("/api_v1/question/", authenticateToken, postQuestion);
router.put("/api_v1/copyQuestionToCatalog", authenticateToken, copyQuestionToCatalog);
router.put("/api_v1/copyQuestion/:id", authenticateToken, copyQuestion);
router.get("/api_v1/allquestionsInCatalog/:id", authenticateToken, getAllquestionsInCatalog);
router.get("/api_v1/allquestionsInCourse/:id", authenticateToken, getAllquestionsInCourse);
router.get("/api_v1/allquestions", authenticateToken, allQuestions);
router.delete("/api_v1/removeQuestionFromCatalog/:questionInCatalog", authenticateToken, deleteQuestionFromCatalog);
router.get("/api_v1/addQuestionToCatalog", authenticateToken, postQuestionToCatalog);

export default router;
