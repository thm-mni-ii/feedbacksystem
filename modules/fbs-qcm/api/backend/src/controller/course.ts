import { Request, Response } from "express";
import { getStudentCourses, getTeacherCourses } from "../course/course";
import { getCatalogScore } from "../catalog/catalog";
import { getCurrentQuestion } from "../question/question";

const teacherCourse = ( async (req: Request, res: Response) => {
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
const studentCourse = ( async (req: Request, res: Response) => {
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
const getSingleCatalogScore = (async (req:Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const sessionId = req.params.sessionId as string;
        console.log(sessionId);
        const result = await getCatalogScore(req.user, sessionId);
        if(result === -1) {
          res.sendStatus(400);
        }
        if(result === -2) {
          res.sendStatus(401);
        }
        if(result === -3) {
          res.sendStatus(404);
        }
        res.send(result);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
});
export {
    teacherCourse,
    studentCourse,
    getSingleCatalogScore,
}
