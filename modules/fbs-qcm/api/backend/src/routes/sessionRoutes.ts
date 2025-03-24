import { Router } from 'express';
import { endSession, ongoingSession, openSessions, pauseSession, pausedSessions, startSession, unpauseSession } from '../controller/session';
import { authenticateToken } from '../authenticateToken';

const router = Router();

router.post("/api_v1/startSession", authenticateToken, startSession);
router.put("/api_v1/pauseSession", authenticateToken, pauseSession);
router.put("/api_v1/unpauseSession", authenticateToken, unpauseSession);
router.put("/api_v1/endSession/:sessionId", authenticateToken, endSession);
router.get("/api_v1/getOngoingSession", authenticateToken, ongoingSession);
router.get("/api_v1/getPausedSessions", authenticateToken, pausedSessions);
router.get("/api_v1/getOpenSessions", authenticateToken, openSessions);

export default router;

