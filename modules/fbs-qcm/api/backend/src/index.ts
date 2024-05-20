import express, { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { postCatalog, getCatalog, deleteCatalog, putCatalog, getCatalogScore } from "./catalog/catalog";
import { postQuestion, getQuestionById, deleteQuestionById, putQuestion, getAllQuestions, getCurrentQuestion } from "./question/question";
import { submit } from "./submission/submission";

interface User {
    username: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

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
            const requestData = req.body;
            const catalog = requestData.catalog;
            delete requestData.catalog;
            const data = await postQuestion(requestData, req.user, catalog); 
            if(data === -1) {
                res.sendStatus(403);
            }else if(data !== null && Object.keys(data).length > 0) {
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
            console.log(1);
            const requestData = req.body;
            console.log(2);
            const response = await submit(req.user, requestData);
            console.log(3);
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
app.get("/api_v1/course", authenticateToken, async (req, res) => {
    try {
        if(req.user == undefined) {
            res.sendStatus(401);
        }
        if(req.user !== undefined) {

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
            const res = getCurrentQuestion(req.user, catalogId);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});


function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })
}
app.listen(3000, () => console.log("LISTENING on port 3000"));
