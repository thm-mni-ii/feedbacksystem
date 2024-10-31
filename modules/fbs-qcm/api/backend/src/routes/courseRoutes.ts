import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
import { getCurrentQuestion } from '../question/question';
import { getCatalogScore } from '../catalog/catalog';
import { getStudentCourses, getTeacherCourses } from '../course/course';
 // get all catalogs from a course with the course id as a path parameter
 const router = Router();
router.get("/api_v1/teacher_course", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
        return;
      }
      if (req.user !== undefined) {
        const authHeader = req.headers["authorization"];
        const token: any = authHeader && authHeader.split(" ")[1];
        const result = await getTeacherCourses(token, req.user);
        console.log("HI");
        console.log(result);
        res.send(result);
        return;
      }
    } catch (error) {
      res.sendStatus(500);
    }
  });
  router.get("/api_v1/student_course", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
        return;
      }
      if (req.user !== undefined) {
        const authHeader = req.headers["authorization"];
        const token: any = authHeader && authHeader.split(" ")[1];
        const result = await getStudentCourses(token, req.user);
        console.log(result);
        res.send(result);
        return;
      }
    } catch (error) {
      res.sendStatus(500);
    }
  });
  router.get("/api_v1/catalog_score", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const catalogId = req.query.ID as string;
        const result = await getCatalogScore(req.user, catalogId);
        res.send(result);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.get("/api_v1/current_question", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const catalogId = req.query.ID as string;
        const result = await getCurrentQuestion(req.user, catalogId);
        console.log(result);
        res.send(result);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

  export default router; 