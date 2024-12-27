import { allQuestionsInCatalog, getCatalog } from "../catalog/catalog";
import { allQuestionInCourse } from "../course/course";
import { Question } from "../model/Question";
import { addQuestionToCatalog, copyQuestion, copyQuestionToCatalog, deleteQuestionById, getAllQuestions, getQuestionById, postQuestion, putQuestion, removeQuestionFromCatalog } from "../question/question";
import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
 // get all catalogs from a course with the course id as a path parameter
 const router = Router();
router.get("/api_v1/question/:id", authenticateToken, async (req, res) => {
    try {
      const questionId = req.params.id as string;
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const data = await getQuestionById(questionId, req.user);
        console.log("data");
        console.log(data);
        if (data !== null) {
          res.send(data);
        } else {
          res.sendStatus(403);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.delete("/api_v1/question/:id", authenticateToken, async (req, res) => {
    try {
      const questionId = req.params.id as string;
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const data = await deleteQuestionById(questionId, req.user);
        if (data !== null && Object.keys(data).length > 0) {
          res.send(data);
        } else {
          res.sendStatus(500);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.put("/api_v1/question/", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        console.log(req.body);
        const requestData = req.body;
        delete requestData.children;
        delete requestData.catalog;
        const question: Question = requestData;
        const data = await putQuestion(question, req.user);
        if (data === -1) {
          res.sendStatus(403);
        } else {
          res.sendStatus(200);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.post("/api_v1/question", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        console.log(req.body);
        const requestData = req.body;
        const question: Question = requestData;
        console.log(question);
        const data = await postQuestion(question, req.user);
        if (data === 1) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.put(
    "/api_v1/copyQuestionToCatalog",
    authenticateToken,
    async (req, res) => {
      try {
        if (req.user == undefined) {
          res.sendStatus(401);
        }
        if (req.user !== undefined) {
          console.log(req.body);
          const requestData = req.body;
          const questionId: string = requestData.question;
          const catalogId: string = requestData.catalog;
          const children: string[] = requestData.children;
          const data = await copyQuestionToCatalog(
            req.user,
            questionId,
            catalogId,
            children
          );
          if (data === -1) {
            res.sendStatus(403);
          } else {
            res.send({ id: data });
          }
        }
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
    }
  );
  router.put("/api_v1/copyQuestion/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        console.log(req.body);
        const requestData = req.body;
        const questionId = req.params.id as string;
        const data = await copyQuestion(req.user, questionId);
        if (data === -2) {
          res.sendStatus(400);
        }
        res.send({ id: data });
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.get(
    "/api_v1/allquestionsInCatalog/:id",
    authenticateToken,
    async (req, res) => {
      try {
        if (req.user == undefined) {
          res.sendStatus(401);
        }
        if (req.user !== undefined) {
          const catalogId = req.params.id as string;
          const data = await allQuestionsInCatalog(req.user, catalogId);
          if (data === -1) {
            res.sendStatus(403);
          }
          res.send(data);
        }
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
    }
  );
  router.get(
    "/api_v1/allquestionsInCourse/:id",
    authenticateToken,
    async (req, res) => {
      try {
        if (req.user == undefined) {
          res.sendStatus(401);
        }
        if (req.user !== undefined) {
          const courseId = parseInt(req.params.id);
          const data = await allQuestionInCourse(req.user, courseId);
          if (data === -1) {
            res.sendStatus(403);
          }
          res.send(data);
        }
      } catch (error) {
        res.sendStatus(500);
      }
    }
  );
  router.get("/api_v1/allquestions", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const data = await getAllQuestions(req.user);
        /*if (data === -1) {
          res.sendStatus(403);
        }*/
        res.send(data);
      }
    } catch (error) {
      res.sendStatus(500);
    }
  });
  router.delete(
    "/api_v1/removeQuestionFromCatalog/:questionInCatalog",
    authenticateToken,
    async (req, res) => {
      try {
        if (req.user == undefined) {
          res.sendStatus(401);
        }
        if (req.user !== undefined) {
          const requestData = req.params.questionInCatalog;
          const result = await removeQuestionFromCatalog(
            req.user,
            requestData
          );
          if (result == -1) {
            res.send(403);
          } else {
            res.sendStatus(200);
          }
        }
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
    }
  );
  router.put(
    "/api_v1/addQuestionToCatalog",
    authenticateToken,
    async (req, res) => {
      try {
        if (req.user == undefined) {
          res.sendStatus(401);
        }
        if (req.user !== undefined) {
          const requestData = req.body;
          const questionId: string = requestData.question;
          const catalog: string = requestData.catalog;
          const children = requestData.children;
          const result = await addQuestionToCatalog(
            req.user,
            questionId,
            catalog,
            children
          );
          if (result == -1) {
            res.send(403);
          } else {
            res.send(result);
          }
        }
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
    }
  );

  export default router; 
