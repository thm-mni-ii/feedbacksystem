import { Request, Response } from "express";
import { submitSessionAnswer } from "../submission/submission";
const submission = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const requestData = req.body;
        console.log(requestData);
        const question = requestData.question;
        const answers = requestData.answers;
        const response = await submitSessionAnswer(req.user, question, answers);
        console.log(response);
        if (response == -1) {
          res.sendStatus(403);
          return;
        }
        const responseJson = {
          correct: response,
        };
        res.send(responseJson);
      } else {
        res.sendStatus(403);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
});

export {
    submission
};
