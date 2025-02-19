import { Router } from 'express';
import { authenticateToken } from '../authenticateToken';
import { addChildrenToQuestion, changeNeededScore, currentQuestion, deleteCatalog, editCatalog, editEmptyCatalog, getCatalog, getCatalogScore, getCatalogs, getPreviousQuestion, postCatalog, putCatalog } from '../controller/catalog';

const router = Router();


router.get("/api_v1/catalogs/:id", authenticateToken, getCatalogs);
router.get("/api_v1/catalog/:id",  authenticateToken, getCatalog);
router.delete("/api_v1/catalog/:id", authenticateToken, deleteCatalog);
router.put("/api_v1/catalog/:id", authenticateToken, putCatalog);
router.post("/api_v1/catalog", authenticateToken, postCatalog);
router.put("/api_v1/addChildrenToQuestion/", authenticateToken, addChildrenToQuestion);
router.get("/api_v1/editCatalog/:catalog/:id", authenticateToken, editCatalog);
router.get("/api_v1/getPreviousQuestion/:catalog/:question", authenticateToken, getPreviousQuestion);
router.get("/api_v1/editEmptyCatalog/:id", authenticateToken, editEmptyCatalog);
router.get("/api_v1/current_question", authenticateToken, currentQuestion);
router.put("/api_v1/change_needed_score", authenticateToken, changeNeededScore);
router.get("/api_v1/getCatalogScore/:courseId/:catalogId", authenticateToken, getCatalogScore);

export default router;
