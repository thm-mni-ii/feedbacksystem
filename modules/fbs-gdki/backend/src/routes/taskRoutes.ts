import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { deleteTask, getTask, getTaskText, postTask, putTask } from '../controller/task';

const router = Router();

router.post("/api/v1/createTask", authenticateToken, postTask)
router.delete("/api/v1/deleteTask:taskId", authenticateToken, deleteTask)
router.put("/api/v1/putTask:taskId", authenticateToken, putTask)
router.get("/api/v1/getTask:taskId", authenticateToken, getTask)
router.get("api/v1/getTaskText:taskId", authenticateToken, getTaskText)

export default router;