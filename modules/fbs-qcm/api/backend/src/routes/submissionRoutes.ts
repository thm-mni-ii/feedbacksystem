import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { submission } from '../controller/submission';

const router = Router();

router.post("/api_v1/submission", authenticateToken, submission);

export default router;

