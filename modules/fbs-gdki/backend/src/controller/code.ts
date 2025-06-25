import { Request, Response} from "express"
import { executePythonCode, generateHint } from "../code/code";

export const executeCode = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
      const taskId = (req.params.task) as string; 
      const code = req.body.code as string;
      const data = await executePythonCode(req.user, taskId, code);
      res.send(data);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
export const getHint = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
      const taskId = (req.params.task) as string; 
      const code = req.body.code as string;
      const data = await generateHint(req.user, taskId, code);
      res.send(data);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};