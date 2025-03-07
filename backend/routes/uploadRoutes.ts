import express from "express";
import multer from "multer";
import { uploadCSV, getRegisterData, uploadExcel, getPendingApprovals, approveUpload, rejectUpload } from "../controllers/upload/index";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // กำหนดโฟลเดอร์อัปโหลด

router.post("/upload-csv", upload.single("file"), uploadCSV);

router.post("/upload-excel", upload.single("file"), uploadExcel);

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

export default router;
