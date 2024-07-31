import express, { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { postCatalog, getCatalog, deleteCatalog, putCatalog, getCatalogScore, getUser, getQuestionTree } from "./catalog/catalog";
import { postQuestion, getQuestionById, deleteQuestionById, putQuestion, getAllQuestions, getCurrentQuestion, addQuestionToCatalog, getCurrentSessionQuestion } from "./question/question";
import { submit, submitSessionAnswer } from "./submission/submission";
import { getStudentCourses, getTeacherCourses } from "./course/course";
import { connect } from "./mongo/mongo";
import * as mongoDB from "mongodb";
import { AnswerScore } from "./utils/enum";
import { endSession, getOngoingSessions, getOpenSessions, getPausedSessions, pauseSession, startSession } from "./session/session";

interface User {
    username: string;
    id: number
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

async function createDatabaseAndCollection() {

  try {
    const db = await connect();
    const courseCollection: mongoDB.Collection = db.collection("course");
    const catalogCollection: mongoDB.Collection = db.collection("catalog");
    const questionCollection: mongoDB.Collection = db.collection("question");
    const submissionCollection: mongoDB.Collection = db.collection("submission");
    const userCollection: mongoDB.Collection = db.collection("user");
    const questionInCatalogCollection: mongoDB.Collection = db.collection("questionInCatalog");
    const cataloginCourseCollection: mongoDB.Collection = db.collection("catalogInCourse");
    await questionCollection.insertOne({
        "_id": new mongoDB.ObjectId("6638fbdb7cbf615381a90abe"),
      "questiontext": "Wie viele Bits sind ein Byte",
      "answers": [
        {
          "text": "8",
          "isCorrect": true,
          "position": -1
        },
        {
          "text": "16",
          "isCorrect": false,
          "position": -1
        }
      ],
      "weighting": 1,
      "questiontype": "Single-Choice",
      "questionconfiguratin": "none"
    });
    await questionCollection.insertOne({
      "_id": new mongoDB.ObjectId("663e087990e19a7cb3f4a3d7"),
      "questiontext": "TEST",
      "answers": [
        {
          "text": "string",
          "isCorrect": true,
          "position": 0
        }
      ],
      "weighting": 0,
      "questiontype": "Single-Choice",
      "questionconfiguratin": "goar keine"
    });
    await questionCollection.insertOne({
      "_id": new mongoDB.ObjectId("66474b198d1fcd0b3079e6fe"),
      "questiontext": "Was ist mehr als ein KiloByte",
      "answers": [
        {
          "text": "Byte",
          "isCorrect": false,
          "position": -1
        },
        {
          "text": "MegaByte",
          "isCorrect": true,
          "position": -1
        },
        {
          "text": "GigaByte",
          "isCorrect": true,
          "position": -1
        },
        {
          "text": "PetaByte",
          "isCorrect": true,
          "position": -1
        }
      ],
      "weighting": 1,
      "questiontype": "Multiple-Choice",
      "questionconfiguratin": "none"
    });
    await catalogCollection.insertOne(
            {
      "_id": new mongoDB.ObjectId("663a51d228d8781d96050905"),
      "name": "Grundlagen",
    });
    await courseCollection.insertOne(
        {
        "_id": new mongoDB.ObjectId("6696827f0642c847d4953925"),
        "courseId": 187
        });
    await cataloginCourseCollection.insertOne({ 
        "course": 187,
        "catalog": new mongoDB.ObjectId("663a51d228d8781d96050905"),
        "requirements": []
    }); 
    await userCollection.insertOne({
      "_id": new mongoDB.ObjectId("664b08e0448b1678f0393a7e"),
      "id": 1,
      "catalogscores": {
        "663a51d228d8781d96050905": 75
      }
    });
    submissionCollection.insertOne({
      "_id": new mongoDB.ObjectId("664b63aefa0e9768d9ffd02a"),
      "user": 1,
      "question": new mongoDB.ObjectId("6638fbdb7cbf615381a90abe"),
      "answer": [
        "8"
      ],
      "evaluation": AnswerScore.correct,
      "timeStamp": {
        "$numberLong": "1716216750416"
      }
    });
    await questionInCatalogCollection.insertOne({
        catalog: new mongoDB.ObjectId("663a51d228d8781d96050905"),
        question: new mongoDB.ObjectId("6638fbdb7cbf615381a90abe"),
        weighting: 1,
        children: {
            "TRUE": new mongoDB.ObjectId("663e087990e19a7cb3f4a3d7"),
            "FALSE": new mongoDB.ObjectId("66474b198d1fcd0b3079e6fe"),
            "PARTIAL": ""
        }
    });
    await questionInCatalogCollection.insertOne({
        catalog: new mongoDB.ObjectId("663a51d228d8781d96050905"),
        question: new mongoDB.ObjectId("66474b198d1fcd0b3079e6fe"),
        weighting: 1,
        children: {
            "TRUE": "",
            "FALSE": "",
            "PARTIAL": ""
        }
    });
    await questionInCatalogCollection.insertOne({
        catalog: new mongoDB.ObjectId("663a51d228d8781d96050905"),
        question: new mongoDB.ObjectId("663e087990e19a7cb3f4a3d7"),
        weighting: 1,
        children: {
            "TRUE": "",
            "FALSE": "",
            "PARTIAL": ""
        }
    });
  } catch (err) {
    console.error(`Error creating database or collection: ${err}`);
  }
}


async function startServer() {
  await createDatabaseAndCollection();

  const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));


    app.get("/api_v1/question", authenticateToken, async (req, res) => {
        try {
            const questionId = req.query.ID as string;
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const data = await getQuestionById(questionId, req.user);
                console.log("data");
                console.log(data);
                if(data !== null && Object.keys(data).length > 0) {
                    res.send(data);
                } else {
                    res.sendStatus(403);
                }
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.delete("/api_v1/question", authenticateToken, async (req, res) => {
        try {
            const questionId = req.query.ID as string;
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const data = await deleteQuestionById(questionId, req.user);
                if(data !== null && Object.keys(data).length > 0) {
                    res.send(data);
                } else {
                    res.sendStatus(500);
                }
            }
        } catch (error) {
            res.sendStatus(500);
        }

    });
    app.put("/api_v1/question/", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const requestData = req.body;
                const catalog = requestData.catalog;
                const questionId = req.query.questionID as string;
                delete requestData.catalog;
                const data = await putQuestion(questionId, requestData, req.user, catalog); 
                if(data === -1) {
                    res.sendStatus(403);
                } else {
                    res.sendStatus(200);
                }
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.post("/api_v1/question", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                console.log(req.body);
                const requestData = req.body;
                const catalog = requestData.catalog;
                const children = requestData.children;
                const weighting = requestData.weighting;
                delete requestData.weighting;
                delete requestData.children;
                delete requestData.catalog;
                const data = await postQuestion(requestData, req.user, catalog, children, weighting); 
                if(data === -1) {
                    res.sendStatus(403);
                }else if(data === 1) {
                    res.sendStatus(201);
                } else {
                    res.sendStatus(403);
                }
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/allquestions", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const data = await getAllQuestions(req.user);
                res.send(data);
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/catalog", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            const catalogId = req.query.ID as string;
            if(req.user !== undefined) {
                const data = await getCatalog(req.user, catalogId); 
                if(data == -1) {
                    res.sendStatus(403);
                } else {
                    res.send(data);
                }
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.delete("/api_v1/catalog", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            const catalogId = req.query.ID as string;
            if(req.user !== undefined) {
                const data = await deleteCatalog(req.user, catalogId); 
                if(data == -1) {
                    res.sendStatus(403);
                } else {
                    res.send(data);
                }
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/question_tree", authenticateToken, async (req, res) => {
        try {
            if (req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const requestData = req.body;
                const catalogId = req.query.ID as string;
                const data = await getQuestionTree(req.user, catalogId);
                res.send(data);
                if( data == -1) {
                    res.sendStatus(403);
                }
            }
        } catch {
            res.sendStatus(500);
        }
    });
    app.put("/api_v1/catalog",authenticateToken, async (req, res) => {
        try {
            if (req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const requestData = req.body;
                const course = requestData.course;
                const questionId = req.query.ID as string;
                delete requestData.course;
                const data = await putCatalog(questionId, requestData, req.user, course);
                if(data == -1) {
                    res.sendStatus(403);
                }
                res.sendStatus(200);
            }
        } catch {
            res.sendStatus(500);
        }
    });
    app.post("/api_v1/catalog", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const requestData = req.body;
                const course = requestData.course;
                delete requestData.course;
                const data = await postCatalog(requestData, req.user, course); 
                if(data == 0) {
                    res.sendStatus(201);
                } else {
                    res.sendStatus(403);
                }
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.post("/api_v1/submission", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const requestData = req.body;
                const response = await submit(req.user, requestData);
                if(response == -1) {
                    res.sendStatus(403);
                    return;
                }
                const responseJson = {
                    correct: response
                }
                res.send(responseJson);
            } else {
                res.sendStatus(403);
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/teacher_course", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const result = await getTeacherCourses(req.user);
                console.log("HI");
                console.log(result);
                res.send(result);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/student_course", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const result = await getStudentCourses(req.user);
                console.log(result);
                res.send(result);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/catalog_score", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const catalogId = req.query.ID as string;
                const result = await getCatalogScore(req.user, catalogId);
                res.send(result);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/current_question", authenticateToken, async (req, res) => {
        try {
            if(req.user == undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const catalogId = req.query.ID as string;
                console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM");
                const result = await getCurrentQuestion(req.user, catalogId);
                console.log(result);
                res.send(result);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/user", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const result = await getUser(req.user);
                res.send(result);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.put("/api_v1/addQuestionToCatalog", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
            }
            if(req.user !== undefined) {
                const requestData = req.body;
                const questionId = requestData.question;
                const catalogId = requestData.catalog;
                const result = await addQuestionToCatalog(questionId, req.user, catalogId);
                if(result === -1) {
                    res.sendStatus(403);
                    return;
                }
                if(result === -2) {
                    res.sendStatus(400);
                    return;
                }
                if(result === 1) {
                    res.sendStatus(200);
                    return;
                }
                res.sendStatus(500);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.post("/api_v1/startSession", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            if(req.user === undefined) {
                res.sendStatus(403);
                return;
            }
            const requestData = req.body;
            const catalogId = requestData.catalog;
            const courseId = requestData.course;
            if(req.user !== undefined) {
                const result = await startSession(req.user, catalogId, courseId); 
                if(result === -1) {
                    res.sendStatus(403);
                    return;
                }
                console.log("result");
                console.log(result);
                res.send(result);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.put("/api_v1/pauseSession", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            const requestData = req.body;
            const catalogId = requestData.catalog;
            const courseId = requestData.course;
            if(req.user !== undefined) {
                await pauseSession(req.user, catalogId, courseId); 
                res.sendStatus(200);
                return;
            }
            res.sendStatus(500);
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.put("/api_v1/endSession", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            const requestData = req.body;
            const catalogId = requestData.catalog;
            const courseId = requestData.course;
            if(req.user !== undefined) {
                await endSession(req.user, catalogId, courseId); 
                res.sendStatus(200);
                return;
            }
            res.sendStatus(500);
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/currentSessionQuestion", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            if(req.user === undefined) {
                res.send(401);
                return;
            }
            const result = await getCurrentSessionQuestion(req.user);
            if(result === -1) {
                res.send(500);
                return;
            }
            res.send(result);
            
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/submitSessionQuestion", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            const requestData = req.body;
            const result = await submitSessionAnswer(req.user, requestData);
            if(result === -1) {
                res.send(500);
                return;
            }
            res.send(result);
            
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/getOngoingSessions", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            const result = await getOngoingSessions(req.user.id);
            if(result === 0) {
                res.send(500);
                return;
            }
            res.send(result);
            
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/getPausedSessions", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            const result = await getPausedSessions(req.user.id);
            if(result === 0) {
                res.send(500);
                return;
            }
            res.send(result);
            
        } catch (error) {
            res.sendStatus(500);
        }
    });
    app.get("/api_v1/getOpenSessions", authenticateToken, async (req, res) => {
        try {
            if(req.user === undefined) {
                res.sendStatus(401);
                return;
            }
            const result = await getOpenSessions(req.user.id);
            if(result === 0) {
                res.send(500);
                return;
            }
            res.send(result);
            
        } catch (error) {
            res.sendStatus(500);
        }
    });
    function authenticateToken(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) {
            console.log("no token");
            return res.sendStatus(401);
        }
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                console.log(req);
                console.log(err);
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        })
    }
    app.listen(3000, () => console.log("LISTENING on port 3000"));
}
startServer().catch(console.error);
