import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { allTags, createTag, deleteTag, editTag, findTag, searchTag } from '../controller/tag';

const router = Router();

router.get("/api_v1/searchTag", authenticateToken, searchTag);
router.get("/api_v1/findTag", authenticateToken, findTag);
router.delete("/api_v1/deleteTag", authenticateToken, deleteTag);
router.put("/api_v1/editTag", authenticateToken, editTag);
router.post("/api_v1/createTag", authenticateToken, createTag);
router.get("/api_v1/getAllTags", authenticateToken, allTags)

export default router;
