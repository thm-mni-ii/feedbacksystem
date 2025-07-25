import { Request, Response } from "express";
import {
  addQuestionToSkill,
  createSkill,
  removeQuestionFromSkill,
  getSkillsByCourse,
  getSkillProgressByCourse,
  deleteSkill as deleteSkillService,
  updateSkill,
} from "../skill/skill";
import { SkillInsertion } from "../model/utilInterfaces";

const putQuestionToSkill = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const skillId = req.params.skillId;
      const questionId = req.params.questionId;
      const response: number | Object = await addQuestionToSkill(
        req.user,
        skillId,
        questionId
      );
      if (response === -1) {
        return res.sendStatus(500);
      } else if (response === -2) {
        res.sendStatus(403);
      } else {
        res.send(response);
      }
    }
    console.log("kein Nutzer gefunden");
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const deleteQuestionFromSkill = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const skillId = req.params.skillId;
      const questionId = req.params.questionId;
      const response: number | Object = removeQuestionFromSkill(
        req.user,
        skillId,
        questionId
      );
      if (response === -1) {
        res.sendStatus(500);
      } else if (response === -2) {
        res.sendStatus(403);
      } else {
        res.send(response);
      }
    }
    console.log("kein Nutzer gefunden");
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const postSkill = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log("kein Nutzer gefunden");
      return res.sendStatus(500);
    }
    const requestData = req.body;
    const dataInsert: SkillInsertion = {
      name: requestData.name,
      course: requestData.course,
      description: requestData.description,
      isPublic: requestData.isPublic,
      difficulty: requestData.difficulty,
    };
    const response: number | Object = await createSkill(req.user, dataInsert);
    if (response === -1) {
      return res.sendStatus(500);
    } else {
      res.send(response);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const deleteSkill = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const skillId = req.params.skillId;
    const result = await deleteSkillService(req.user, skillId);

    if (result === -1) return res.sendStatus(500);
    if (result.deletedCount === 0)
      return res.status(404).send("Skill not found");

    res.sendStatus(200);
  } catch (error) {
    console.error("Controller error deleting skill:", error);
    res.sendStatus(500);
  }
};

const editSkill = async (req: Request, res: Response) => {
  try {
    // Authentifizierung: angenommen, dein Middleware hat req.user mit JwtPayload gesetzt
    if (!req.user) {
      return res.status(401).json({ message: "Nicht autorisiert" });
    }

    const skillId = req.params.skillId; // z.B. aus URL /skills/:skillId
    const updatedFields = req.body; // Die Felder, die geändert werden sollen

    // Service-Methode aufrufen
    const result = await updateSkill(req.user, skillId, updatedFields);

    if (result === -1) {
      return res
        .status(500)
        .json({ message: "Fehler beim Aktualisieren des Skills" });
    }

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Skill nicht gefunden oder keine Änderung" });
    }

    res.status(200).json({ message: "Skill erfolgreich aktualisiert" });
  } catch (error) {
    console.error("Fehler in editSkill:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};
const getLearnSessionQuestion = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const skillId = req.params.learnSessionId;
      //Methodenimplementierung
    }
    console.log("no user found");
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const getLearnSessionSettings = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const learnSessionId = req.params.learnSessionId;
      //Methodenimplementierung
    }
    console.log("no user found");
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const putLearnSessionSettings = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const learnSessionId = req.params.learnSessionId;
      //Methodenimplementierung
    }
    console.log("no user found");
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const getSkill = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const skillId = req.params.skillId;
      //Methodenimplementierung
    }
    console.log("no user found");
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const postLearnSession = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      //Methodenimplementierung
    }
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const endLearnSession = async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const learnSessionId = req.params.learnSessionId;
      //Methodenimplementierung
    }
    console.log("kein Nutzer gefunden");
    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const getSkillsForCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    if (!req.user) {
      return res.sendStatus(401);
    }
    const skills = await getSkillsByCourse(req.user, courseId);
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const getSkillProgressForCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    if (!req.user) {
      return res.sendStatus(401);
    }
    const progress = await getSkillProgressByCourse(req.user, courseId);
    res.json(progress);
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
  getSkillProgressForCourse,
};
