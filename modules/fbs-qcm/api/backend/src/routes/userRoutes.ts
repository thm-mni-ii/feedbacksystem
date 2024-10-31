import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
import { getUser } from '../catalog/catalog';
 // get all catalogs from a course with the course id as a path parameter
 const router = Router();

router.get("/api_v1/user", authenticateToken, async (req, res) => {
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

  export default router; 