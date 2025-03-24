import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { getSingleCatalogScore, studentCourse, teacherCourse } from '../controller/course';

const router = Router();


router.get("/api_v1/teacher_course", authenticateToken, teacherCourse);
router.get("/api_v1/student_course", authenticateToken, studentCourse);

export default router;

