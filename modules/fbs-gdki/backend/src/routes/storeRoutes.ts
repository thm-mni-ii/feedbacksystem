import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { getCode, storeCode } from '../controller/store';

const router = Router();

router.put("/api/v1/storeCode/:task", authenticateToken,  storeCode);
router.get("/api/v1/getCode/:task", authenticateToken,  getCode);

export default router;