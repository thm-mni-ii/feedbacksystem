import { Request, Response } from "express";

const putQuestionToSkill = ( async (req: Request, res: Response) => {
  try {
    if (req.user === undefined) {
      res.sendStatus(401);
    }
    if (req.user !== undefined) {
        const skill = req.params.skillId;
        const question = req.params.questionId;
        //Methodenimplementierung
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
        const skill = req.params.skillId;
        const question = req.params.questionId;
        //Methodenimplementierung
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
        //Methodenimplementierung
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
    console.log("kein Nutzer gefunden");
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
    console.log("kein Nutzer gefunden");
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
    console.log("kein Nutzer gefunden");
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
    getSkill
};