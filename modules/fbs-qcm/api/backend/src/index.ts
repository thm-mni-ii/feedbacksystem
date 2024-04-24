import express, { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { getQuestionById } from "./question/question";

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

app.get("/api_v1/question", authenticateToken, async (req, res) => {
    try {
        const questionId = req.query.ID as string;
        console.log(req.user);
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
app.delete("/api_v1/question", (req, res) => {

});
app.put("/api_v1/question", (req, res) => {

});
app.post("/api_v1/question", (req, res) => {

});
app.get("/api_v1/category", (req, res) => {

});
app.delete("/api_v1/category", (req, res) => {

});
app.put("/api_v1/category", (req, res) => {

});
app.post("/api_v1/category", (req, res) => {

});
app.get("/api_v1/submission", (req, res) => {

});
app.delete("/api_v1/submission", (req, res) => {

});
app.put("/api_v1/submission", (req, res) => {

});
app.post("/api_v1/submission", (req, res) => {

});
app.get("/api_v1/course", (req, res) => {

});


function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })
}
app.listen(3000, () => console.log("LISTENING on port 3000"));
