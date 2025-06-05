import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { executeCode } from '../controller/code';

const router = Router();

router.post("/api/v1/executeCode/:task", authenticateToken,  executeCode);

export default router;