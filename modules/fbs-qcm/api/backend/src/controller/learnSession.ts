import { Request, Response } from "express";
import {
  startLearnSessionService,
  getCurrentLearnQuestionService,
  submitLearnAnswerService,
  endLearnSessionService,
} from "../learnSession/learnSession";
import * as mongoDB from "mongodb";
import { connect } from "../mongo/mongo";

export const startLearnSession = async (req: Request, res: Response) => {
  console.log("START LEARN SESSION ---->", req);
  console.log(req.body);
  try {
    if (!req.user) return res.sendStatus(401);
    const { course } = req.body;
    const session = await startLearnSessionService(req.user, course);
    if (!session) return res.sendStatus(500);
    return res.status(201).json(session);
  } catch (error) {
    console.error("Error starting learn session:", error);
    res.sendStatus(500);
  }
};

export const getCurrentLearnQuestion = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const { sessionId } = req.params;
    const question = await getCurrentLearnQuestionService(req.user, sessionId);
    if (!question) return res.status(404).send("No current question");
    return res.json(question);
  } catch (error) {
    console.error("Error getting current learn question:", error);
    res.sendStatus(500);
  }
};

export const submitLearnAnswer = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const { sessionId } = req.params;
    const { answer } = req.body;
    const result = await submitLearnAnswerService(req.user, sessionId, answer);
    if (result === -1) return res.status(500).send("Error submitting answer");
    return res.json(result);
  } catch (error) {
    console.error("Error submitting learn answer:", error);
    res.sendStatus(500);
  }
};

export const endLearnSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const { sessionId } = req.params;
    const result = await endLearnSessionService(req.user, sessionId);
    if (result === -1) return res.status(500).send("Error ending session");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error ending learn session:", error);
    res.sendStatus(500);
  }
};

export const getOngoingLearnSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const courseId = req.query.courseId
      ? Number(req.query.courseId)
      : undefined;
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection =
      database.collection("learnSession");
    const query: any = {
      user: req.user.id,
      status: "ongoing",
    };
    if (courseId !== undefined) query.course = courseId;
    const session = await sessionCollection.findOne(query);
    res.json(session);
  } catch (error) {
    console.error("Error getting ongoing learn session:", error);
    res.sendStatus(500);
  }
};
