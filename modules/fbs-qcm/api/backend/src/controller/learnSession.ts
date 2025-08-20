import { Request, Response } from "express";
import {
  startLearnSessionService,
  getCurrentLearnQuestionService,
  submitLearnAnswerService,
  endLearnSessionService,
} from "../learnSession/learnSession";

// Startet eine neue Lern-Session für einen Kurs.
export const startLearnSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);
    // Erwarte im Body z. B. { course: number, additionalParams... }
    const { course } = req.body;
    const session = await startLearnSessionService(req.user, course);
    if (!session) return res.sendStatus(500);
    return res.status(201).json(session);
  } catch (error) {
    console.error("Error starting learn session:", error);
    res.sendStatus(500);
  }
};

// Liefert die aktuelle Frage der Lern-Session
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

// Nimmt eine Antwort für die aktuelle Frage entgegen
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

// Beendet die Lern-Session
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
