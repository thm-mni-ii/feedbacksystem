import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';

const router = Router();

router.post("/api/v1/createTask", authenticateToken, ...)

export default router;