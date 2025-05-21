import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { storeCode, storeCode2 } from '../controller/store';

const router = Router();

router.put("/api/v1/storeCode/:task", authenticateToken,  storeCode);

export default router;