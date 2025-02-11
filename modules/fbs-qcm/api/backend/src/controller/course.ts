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
const catalogScore = (async (req:Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const catalogId = req.params.id as string;
        const result = await getCatalogScore(req.user, catalogId);
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
    catalogScore,
}
