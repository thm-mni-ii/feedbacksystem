import { Request, Response} from "express";
import { createTask, deleteTaskById, getTaskById, getTaskTextById, updateTask } from "../task/task";

export const postTask = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        const task = req.body.task;
        const result = await createTask(req.user, task);
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
export const deleteTask = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        const task = req.body.task;
        const result = await deleteTaskById(req.user, task);
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
export const putTask = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        const task = req.body.task;
        const result = await updateTask(req.user, task);
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
export const getTask = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        const task = req.body.task;
        const result = await getTaskById(req.user, task);
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
export const getTaskText = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        const task = req.body.task;
        const result = await getTaskTextById(req.user, task);
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
/*
export const getAllAvailableTasks = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        const result = await getTaskById(req.user);
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
*/