import { deleteCatalog, getCatalogs, postCatalog, putCatalog } from "../catalog/catalog";
import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
 // get all catalogs from a course with the course id as a path parameter
 const router = Router();
 router.get("/api_v1/catalogs/:courseId", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const courseId = req.params.courseId as unknown as number;
      if (req.user !== undefined) {
        const data = await getCatalogs(req.user, courseId);
        if (data == -1) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

  router.delete("/api_v1/catalog/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const catalogId = req.params.id as unknown as string;
      if (req.user !== undefined) {
        const data = await deleteCatalog(req.user, catalogId);
        if (data == -1) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
      }
    } catch (error) {
      res.sendStatus(500);
    }
  });
  router.put("/api_v1/catalog/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const requestData = req.body;
        const authHeader = req.headers["authorization"];
        const token: any = authHeader && authHeader.split(" ")[1];
        const course = requestData.course;
        const catalogId = req.params.id as string;
        delete requestData.course;
        const data = await putCatalog(
          catalogId,
          token,
          requestData,
          req.user,
          course
        );
        if (data == -1) {
          res.sendStatus(403);
        }
        res.sendStatus(200);
      }
    } catch {
      res.sendStatus(500);
    }
  });
  router.post("/api_v1/catalog", authenticateToken, async (req, res) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const authHeader = req.headers["authorization"];
        const token: any = authHeader && authHeader.split(" ")[1];
        const requestData = req.body;
        const course = requestData.course;
        delete requestData.course;
        const data = await postCatalog(requestData, token, req.user, course);
        if (data !== -1) {
          res.send(data);
        } else {
          res.sendStatus(403);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

  export default router; 