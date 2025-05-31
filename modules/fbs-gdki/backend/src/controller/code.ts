import { Request, Response} from "express"

export const executeCode = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
      const taskId = Number(req.params.task); 
      const code = req.body.code as string;
      const data = await  
      res.send(data);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};