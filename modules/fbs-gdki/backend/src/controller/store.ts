import { Request, Response} from "express";
import { storeCodeForTask } from "../store/store";

export const storeCode = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
      const taskId = Number(req.params.task); 
      const code = req.body.code as string;
      const data = await storeCodeForTask(req.user, taskId, code);
      res.send(data);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};