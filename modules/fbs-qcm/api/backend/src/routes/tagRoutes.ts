import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
import { createTag, deleteTag, editTag, findTag, searchTag } from '../tag/tag';
 // get all catalogs from a course with the course id as a path parameter
 const router = Router();
router.post("/api_v1/createTag", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const tagname = requestData.tag;
      const result = await createTag(req.user, tagname);
      if (result === -1) {
        res.send(403);
      }
      if (result === -2) {
        res.send(400);
      }
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.put("/api_v1/editTag", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const tagname = requestData.tag;
      const tagId = requestData.tagId;
      const result = await editTag(req.user, tagId, tagname);
      if (result === -1) {
        res.send(403);
        return;
      }
      if (result.modifiedCount === 1) {
        res.send(200);
        return;
      }
      console.log(result);
      res.send(400);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.delete("/api_v1/deleteTag", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const tagId = req.query.tagId as string;
      console.log(req.body);
      console.log(tagId);
      const result = await deleteTag(req.user, tagId);
      if (result === -1) {
        res.send(403);
        return;
      }
      if (result.deletedCount === 1) {
        res.send(200);
        return;
      }
      res.send(400);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.get("/api_v1/findTag", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const tagname = req.query.tag as string;
      const result = await findTag(req.user, tagname);
      if (result === -1) {
        res.send(403);
      }
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.get("/api_v1/searchTag", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const tagname = req.query.tag as string;
      const result = await searchTag(req.user, tagname);
      if (result === -1) {
        res.send(403);
      }
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

  export default router; 