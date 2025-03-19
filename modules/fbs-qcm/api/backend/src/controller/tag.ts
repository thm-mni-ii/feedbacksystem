import { Request, Response } from "express";
import { createSingleTag, deleteSingleTag, editSingleTag, findMultipleTags, getAllTags, searchMultipleTags } from "../tag/tag";

const allTags = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const result = await getAllTags(req.user);
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
});

const createTag = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const tagname = requestData.tag;
      const result = await createSingleTag(req.user, tagname);
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

  const editTag = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const tagname = requestData.tag;
      const tagId = requestData.tagId;
      const result = await editSingleTag(req.user, tagId, tagname);
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
  const deleteTag = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const tagId = req.query.tagId as string;
      console.log(req.body);
      console.log(tagId);
      const result = await deleteSingleTag(req.user, tagId);
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
  const findTag = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const tagname = req.query.tag as string;
      const result = await findMultipleTags(req.user, tagname);
      if (result === -1) {
        res.send(403);
      }
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
const searchTag = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const tagname = req.query.tag as string;
      const result = await searchMultipleTags(req.user, tagname);
      if (result === -1) {
        res.send(403);
      }
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

export {
    createTag,
    editTag,
    deleteTag,
    findTag,
    searchTag,
    allTags
}
