import express from "express";
import multer from "multer";
import { getEnhanceTableStructure } from "../controllers/enhanceTable/enhanceTableController";
import { getEnhanceTableFields } from "../controllers/enhanceTable/enhanceTableFieldsController";
import { uploadEnhanceCSV, uploadEnhanceExcel } from "../controllers/enhanceTable/enhanceTableUploadController";
import { authenticateToken } from "../middleware/authMiddleware";

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Route to get EnhanceTable structure
router.get("/structure", authenticateToken, getEnhanceTableStructure);

// Route to get EnhanceTable fields
router.get("/fields/:enhanceTableId", getEnhanceTableFields);

// Routes for file uploads
router.post("/upload-enhance-csv", authenticateToken, upload.single("file"), uploadEnhanceCSV);
router.post("/upload-enhance-excel", authenticateToken, upload.single("file"), uploadEnhanceExcel);

export default router;