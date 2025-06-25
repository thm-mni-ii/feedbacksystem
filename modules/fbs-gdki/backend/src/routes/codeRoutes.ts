import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { executeCode, getHint } from '../controller/code';

const router = Router();

router.post("/api/v1/executeCode/:task", authenticateToken,  executeCode);
router.post("/api/v1/getHint/:task", authenticateToken,  getHint);

export default router;