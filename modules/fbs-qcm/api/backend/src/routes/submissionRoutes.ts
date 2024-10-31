import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
import { submit } from '../submission/submission';
 // get all catalogs from a course with the course id as a path parameter
 const router = Router();
router.post("/api_v1/submission", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const requestData = req.body;
        const response = await submit(req.user, requestData, "");
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

  export default router; 