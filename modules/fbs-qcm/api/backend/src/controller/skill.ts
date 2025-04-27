import { Request, Response } from "express";
import { addQuestionToSkill, createSkill, removeQuestionFromSkill } from "../skill/skill";
import { SkillInsertion } from "../model/utilInterfaces";

const putQuestionToSkill = ( async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
        const skillId = req.params.skillId;
        const questionId = req.params.questionId;
        const response: number | Object = await addQuestionToSkill(req.user, skillId, questionId)
        if(response === -1) {
          res.sendStatus(500);
        } else if(response === -2) {
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
});

const deleteQuestionFromSkill = ( async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
        const skillId = req.params.skillId;
        const questionId = req.params.questionId;
        const response: number | Object = removeQuestionFromSkill(req.user, skillId, questionId)
        if(response === -1) {
          res.sendStatus(500);
        } else if(response === -2) {
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
});

const postSkill = ( async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const requestData = req.body;
      const dataInsert: SkillInsertion = {
        name: requestData.name,
        course: requestData.course,
        requirements: requestData.requirements
      }
      const response: number | Object = createSkill(req.user, dataInsert);
      if(response === -1) {
        res.sendStatus(500);
      } else if(response === -2) {
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
});

const deleteSkill = ( async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const skillId = req.params.skillId;
        //Methodenimplementierung
    }
    console.log("kein Nutzer gefunden");
    res.sendStatus(500); 
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

const editSkill = ( async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
      const skillId = req.params.skillId;
        //Methodenimplementierung
    }
    console.log("kein Nutzer gefunden");
    res.sendStatus(500); 
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

const getLearnSessionQuestion = ( async (req: Request, res: Response) => {
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
});

const getLearnSessionSettings = ( async (req: Request, res: Response) => {
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
});

const putLearnSessionSettings = ( async (req: Request, res: Response) => {
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
});

const getSkill = ( async (req: Request, res: Response) => {
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
});

const postLearnSession = ( async (req: Request, res: Response) => {
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
});

const endLearnSession = ( async (req: Request, res: Response) => {
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
});
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
    endLearnSession
};