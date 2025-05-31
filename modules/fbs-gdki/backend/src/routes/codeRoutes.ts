import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';

const router = Router();

router.put("/api/v1/executeCode/:task", authenticateToken,  );

export default router;