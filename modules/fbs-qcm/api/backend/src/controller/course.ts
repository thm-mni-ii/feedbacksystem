import { Request, Response } from "express";
import { getCatalogScore } from "../catalog/catalog";
import { getCurrentQuestion } from "../question/question";

const getSingleCatalogScore = (async (req:Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const sessionId = req.params.sessionId as string;
        console.log(sessionId);
        const result = await getCatalogScore(req.user, sessionId);
        if(result === -1) {
          res.sendStatus(400);
        }
        if(result === -2) {
          res.sendStatus(401);
        }
        if(result === -3) {
          res.sendStatus(404);
        }
        res.send(result);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
});
export {
    getSingleCatalogScore,
}
