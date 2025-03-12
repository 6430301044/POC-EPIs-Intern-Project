import express from "express";
import multer from "multer";
import { uploadCSV, getRegisterData, uploadExcel, getPendingApprovals, approveUpload, rejectUpload } from "../controllers/upload/index";
import { getPeriods } from "../controllers/upload/periodController";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // กำหนดโฟลเดอร์อัปโหลด

// Specific endpoints for CSV and Excel uploads
router.post("/upload-csv", upload.single("file"), uploadCSV);
router.post("/upload-excel", upload.single("file"), uploadExcel);

// General upload endpoint that routes to the appropriate controller based on file type
router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์" });
    }
    
    // Route to the appropriate controller based on file type
    if (req.file.mimetype === "text/csv") {
        uploadCSV(req, res);
    } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
               req.file.mimetype === "application/vnd.ms-excel") {
        uploadExcel(req, res);
    } else {
        // Delete the file if it's not a supported type
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting unsupported file:", err);
        });
        
        return res.status(400).json({ message: "ไม่รองรับประเภทไฟล์นี้ กรุณาอัปโหลดไฟล์ CSV หรือ Excel เท่านั้น" });
    }
});


router.get("/register", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const result = await getRegisterData(offset, pageSize);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching register data:", error);
        res.status(500).send('Error fetching register data');
    }
});

// Approval management routes
router.get("/pending-approvals", getPendingApprovals);
router.put("/approve/:uploadId", approveUpload);
router.put("/reject/:uploadId", rejectUpload);

// Period data endpoint for the upload form
router.get("/periods", getPeriods);

export default router;
