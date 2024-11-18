import { Router } from 'express';
import { authenticateToken } from "../authenticateToken";
import { endSession, getOngoingSessions, getOpenSessions, getPausedSessions, pauseSession, startSession, unpauseSession } from '../session/session';
import { getCurrentSessionQuestion } from '../question/question';
import { submitSessionAnswer } from '../submission/submission';
 // get all catalogs from a course with the course id as a path parameter
 const router = Router();

router.post("/api_v1/startSession", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await startSession(req.user, catalogId, courseId);
        if (result === -1) {
          res.sendStatus(403);
          return;
        }
        console.log("result");
        console.log(result);
        res.send(result);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
  router.put("/api_v1/pauseSession", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await pauseSession(req.user, catalogId, courseId);
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
  router.put("/api_v1/unpauseSession", authenticateToken, async (req, res) => {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await unpauseSession(req.user, catalogId, courseId);
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
  router.put("/api_v1/endSession", authenticateToken, async (req, res) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
        return;
      }
      const requestData = req.body;
      const catalogId = requestData.catalog;
      const courseId = requestData.course;
      if (req.user !== undefined) {
        const result = await endSession(req.user, catalogId, courseId);
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
  router.get(
    "/api_v1/currentSessionQuestion",
    authenticateToken,
    async (req, res) => {
      try {
        if (req.user === undefined) {
          res.sendStatus(401);
          return;
        }
        console.log("Start");
        const result = await getCurrentSessionQuestion(req.user);
        if (result === -1) {
          res.send(500);
          return;
        }
        res.send(result);
      } catch (error) {
        res.sendStatus(500);
      }
    }
  );
  router.post(
    "/api_v1/submitSessionAnswer",
    authenticateToken,
    async (req, res) => {
      try {
        if (req.user === undefined) {
          res.sendStatus(401);
          return;
        }
        const requestData = req.body;
        console.log(requestData);
        const result = await submitSessionAnswer(req.user, requestData);
        if (result === -1) {
          res.send(500);
          return;
        }
        res.send(result);
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
    }
  );
  router.get("/api_v1/getOngoingSessions", authenticateToken, async (req, res) => {
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
  router.get("/api_v1/getPausedSessions", authenticateToken, async (req, res) => {
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
  router.get("/api_v1/getOpenSessions", authenticateToken, async (req, res) => {
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

  export default router; 
