import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { catalogScore, studentCourse, teacherCourse } from '../controller/course';

const router = Router();


router.get("/api_v1/teacher_course", authenticateToken, teacherCourse);
router.get("/api_v1/student_course", authenticateToken, studentCourse);
router.get("/api_v1/catalog_score/:id", authenticateToken, catalogScore);

export default router;

