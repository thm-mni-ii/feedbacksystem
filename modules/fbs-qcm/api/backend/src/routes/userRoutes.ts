import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { user } from '../controller/user';

const router = Router();

router.get("/api_v1/user", authenticateToken, user);

export default router;
