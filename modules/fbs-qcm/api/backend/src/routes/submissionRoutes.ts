import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
import { submitSessionAnswer } from '../submission/submission';
const router = Router();
router.post("/api_v1/submission", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const requestData = req.body;
        console.log(requestData);
        const response = await submitSessionAnswer(req.user, requestData);
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
