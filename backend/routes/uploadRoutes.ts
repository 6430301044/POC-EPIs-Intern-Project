import express from "express";
import multer from "multer";
import { uploadCSV, uploadExcel, getPendingApprovals, approveUpload, rejectUpload, deleteDataByPeriod, updateDataByPeriod, getAvailableTables } from "../controllers/upload/index";
import { getPeriods } from "../controllers/upload/periodController";
import { getReferenceData, addReferenceData, updateReferenceData, deleteReferenceData } from "../controllers/upload/referenceDataController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // กำหนดโฟลเดอร์อัปโหลด

// Specific endpoints for CSV and Excel uploads
router.post("/upload-csv", authenticateToken, authorizeRoles(['admin', 'member', 'approver']), upload.single("file"), uploadCSV);
router.post("/upload-excel", authenticateToken, authorizeRoles(['admin', 'member', 'approver']), upload.single("file"), uploadExcel);

// General upload endpoint that routes to the appropriate controller based on file type
router.post("/", authenticateToken, authorizeRoles(['admin', 'member', 'approver']), upload.single("file"), (req, res) => {
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

// Approval management routes
router.get("/pending-approvals", authenticateToken, authorizeRoles(['admin', 'approver']), getPendingApprovals);
router.put("/approve/:uploadId", authenticateToken, authorizeRoles(['admin', 'approver']), approveUpload);
router.put("/reject/:uploadId", authenticateToken, authorizeRoles(['admin', 'approver']), rejectUpload);

// Period data endpoint for the upload form
router.get("/periods", authenticateToken, getPeriods);

// Get available tables for data management
router.get("/available-tables", authenticateToken, getAvailableTables);

// Data management routes
router.delete("/delete-data", authenticateToken, authorizeRoles(['admin']), deleteDataByPeriod);
router.put("/update-data", authenticateToken, authorizeRoles(['admin']), updateDataByPeriod);

// Reference data management routes
router.get("/reference/:table", authenticateToken, getReferenceData);
router.post("/reference/:table", authenticateToken, authorizeRoles(['admin']), addReferenceData);
router.put("/reference/:table/:id", authenticateToken, authorizeRoles(['admin']), updateReferenceData);
router.delete("/reference/:table/:id", authenticateToken, authorizeRoles(['admin']), deleteReferenceData);

export default router;
