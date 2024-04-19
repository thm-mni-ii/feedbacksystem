import express from "express";
import { getQuestionById } from "./question/question";

const app = express();

app.get("/api_v1/question", async (req, res) => {
    try {
        const questionId = req.query.ID as string;
        const data = await getQuestionById(questionId);
        res.send(data);
    } catch (error) {
        res.send(error);      
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


app.listen(3000, () => console.log("LISTENING on port 3000"));
