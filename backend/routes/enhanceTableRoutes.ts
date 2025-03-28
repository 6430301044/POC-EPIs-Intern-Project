import express from "express";
import multer from "multer";
import { getEnhanceTableStructure } from "../controllers/enhanceTable/enhanceTableController";
import { getEnhanceTableFields } from "../controllers/enhanceTable/enhanceTableFieldsController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Route to get EnhanceTable structure
router.get("/structure", authenticateToken, getEnhanceTableStructure);

// Route to get EnhanceTable fields
router.get("/fields/:enhanceTableId", getEnhanceTableFields);

export default router;