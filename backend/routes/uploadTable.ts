import express from "express";
import { Request, Response } from "express";
import { getAllUploadedFiles, getUploadedFileById } from "../controllers/upload/uploadTableController";

const router = express.Router();

// Get all uploaded files with related data
router.get("/files", async (req: Request, res: Response) => {
    try {
        const result = await getAllUploadedFiles();
        res.json(result);
    } catch (error) {
        console.error("Error fetching uploaded files:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

// Get uploaded file by ID
router.get("/file/:id", async (req: Request, res: Response) => {
    try {
        const result = await getUploadedFileById(parseInt(req.params.id));
        
        if (!result) {
            return res.status(404).json({ message: "ไม่พบข้อมูล" });
        }

        res.json(result);
    } catch (error) {
        console.error("Error fetching uploaded file:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

export default router;