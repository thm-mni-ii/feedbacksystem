import { Request, Response } from "express";
import { endSingleSession, getOngoingSessions, getOpenSessions, getPausedSessions, pauseSingleSession, postSession, unpauseSingleSession } from "../session/session";

const startSession = (async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await postSession(req.user, catalogId, courseId);
        if (result === -1) {
          res.sendStatus(403);
          return;
        }
        res.send(result);
        return;
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
const pauseSession = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await pauseSingleSession(req.user, catalogId, courseId);
        if (result === -1) {
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
        return;
      }
      res.sendStatus(500);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  const unpauseSession = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await unpauseSingleSession(req.user, catalogId, courseId);
        if (result === -1) {
          res.sendStatus(400);
        }
        res.sendStatus(200);
        return;
      }
      res.sendStatus(500);
    } catch (error) {
      res.sendStatus(500);
    }
});
const endSession = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await endSingleSession(req.user, catalogId, courseId);
        if (result === -1) {
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
        return;
      }
      res.sendStatus(500);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  const ongoingSessions = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const result = await getOngoingSessions(req.user.id);
      if (result === 0) {
        res.send(500);
        return;
      }
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
const pausedSessions = ( async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const result = await getPausedSessions(req.user.id);
      if (result === 0) {
        res.send(500);
        return;
      }
      res.send(result);
    } catch (error) {
      res.sendStatus(500);
    }
  });
const openSessions = (async (req: Request, res: Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const result = await getOpenSessions(req.user.id);
      if (result === 0) {
        res.send(500);
        return;
      }
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
export {
    startSession,
    pauseSession,
    unpauseSession,
    endSession,
    ongoingSessions,
    pausedSessions,
    openSessions
}
