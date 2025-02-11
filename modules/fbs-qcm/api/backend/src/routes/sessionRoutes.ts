import { Router } from 'express';
import { endSession, ongoingSessions, openSessions, pauseSession, pausedSessions, startSession, unpauseSession } from '../controller/session';
import { authenticateToken } from '../authenticateToken';

const router = Router();

router.post("/api_v1/startSession", authenticateToken, startSession);
router.put("/api_v1/pauseSession", authenticateToken, pauseSession);
router.put("/api_v1/unpauseSession", authenticateToken, unpauseSession);
router.put("/api_v1/endSession", authenticateToken, endSession);
router.get("/api_v1/getOngoingSessions", authenticateToken, ongoingSessions);
router.get("/api_v1/getPausedSessions", authenticateToken, pausedSessions);
router.get("/api_v1/getOpenSessions", authenticateToken, openSessions);

export default router;

