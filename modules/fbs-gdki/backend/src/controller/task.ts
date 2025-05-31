import { Request, Response} from "express";
import { createTask } from "../task/task";

export const postTask = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        const task = req.bory.task;
        const result = createTask(req.user, task);
    if(typeof result === "number") {
      res.sendStatus(result);
    }
    res.send(result);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};