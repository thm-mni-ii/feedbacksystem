import { Request, Response } from "express";
import { getUser } from "../catalog/catalog";

const user = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const result = await getUser(req.user);
        res.send(result);
      }
    } catch (error) {
      res.sendStatus(500);
    }
});

export {
      user
}
