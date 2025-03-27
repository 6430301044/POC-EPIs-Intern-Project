import express from "express";
import multer from "multer";
import { getEnhanceTableStructure } from "../controllers/enhanceTable/enhanceTableController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Route to get EnhanceTable structure
router.get("/structure", authenticateToken, getEnhanceTableStructure);

export default router;