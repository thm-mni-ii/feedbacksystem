import { Request, Response} from "express";

export const storeCode = async (req: Request, res: Response, ) => {
  try {
    if (req.user == undefined) {
      res.sendStatus(401);
    } else {
        //handling
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};