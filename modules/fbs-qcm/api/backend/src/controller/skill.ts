import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import {
  addQuestionToSkill,
  createSkill,
  removeQuestionFromSkill,
  getSkillsByCourse,
} from "../skill/skill";
import { SkillInsertion } from "../model/utilInterfaces";

// Hilfsfunktion für User-Check
function requireUser(req: Request, res: Response): boolean {
  if (!req.user) {
    res.sendStatus(401);
    return false;
  }
  return true;
}

const getSkillsForCourse = async (req: Request, res: Response) => {
  try {
    console.log("ROUTE HIT", req.params);
    const courseId = req.params.courseId;
    const user = req.user as JwtPayload;
    const result = await getSkillsByCourse(user, courseId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const putQuestionToSkill = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const skillId = req.params.skillId;
    const questionId = req.params.questionId;
    const user = req.user as JwtPayload;

    const response: number | Object = await addQuestionToSkill(
      user,
      skillId,
      questionId
    );
    if (response === -1) return res.sendStatus(500);
    if (response === -2) return res.sendStatus(403);

    res.send(response);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const deleteQuestionFromSkill = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const skillId = req.params.skillId;
    const questionId = req.params.questionId;
    const user = req.user as JwtPayload;

    const response: number | Object = await removeQuestionFromSkill(
      user,
      skillId,
      questionId
    );
    if (response === -1) return res.sendStatus(500);
    if (response === -2) return res.sendStatus(403);

    res.send(response);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const postSkill = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const requestData = req.body;
    const dataInsert: SkillInsertion = {
      name: requestData.name,
      course: requestData.course,
      requirements: requestData.requirements,
    };
    const user = req.user as JwtPayload;
    const response: number | Object = await createSkill(user, dataInsert);
    if (response === -1) return res.sendStatus(500);
    if (response === -2) return res.sendStatus(403);

    res.send(response);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const deleteSkill = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const skillId = req.params.skillId;
    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const editSkill = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const skillId = req.params.skillId;
    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const getLearnSessionQuestion = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const learnSessionId = req.params.learnSessionId;
    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const getLearnSessionSettings = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const learnSessionId = req.params.learnSessionId;
    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const putLearnSessionSettings = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const learnSessionId = req.params.learnSessionId;
    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const getSkill = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const skillId = req.params.skillId;
    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const postLearnSession = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const endLearnSession = async (req: Request, res: Response) => {
  try {
    if (!requireUser(req, res)) return;

    const learnSessionId = req.params.learnSessionId;
    // TODO: Methodenimplementierung
    res.sendStatus(501); // Not Implemented
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export {
  putQuestionToSkill,
  deleteQuestionFromSkill,
  postSkill,
  editSkill,
  deleteSkill,
  getLearnSessionQuestion,
  getLearnSessionSettings,
  putLearnSessionSettings,
  getSkill,
  postLearnSession,
  endLearnSession,
  getSkillsForCourse,
};
