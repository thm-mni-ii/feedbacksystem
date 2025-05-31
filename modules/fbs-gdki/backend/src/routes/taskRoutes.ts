import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { postTask } from '../controller/task';

const router = Router();

router.post("/api/v1/createTask", authenticateToken, postTask)
router.post("/api/v1/deleteTask:taskId", authenticateToken, deleteTask)

export default router;