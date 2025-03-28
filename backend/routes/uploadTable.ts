import express from "express";
import { Request, Response } from "express";
import { getAllUploadedFiles } from "../controllers/upload/uploadTableController";

const router = express.Router();

// Get all uploaded files with related data
// router.get("/files", async (req: Request, res: Response) => {
//     try {
//         const result = await getAllUploadedFiles();
//         res.json(result);
//     } catch (error) {
//         console.error("Error fetching uploaded files:", error);
//         res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
//     }
// });
router.get("/", getAllUploadedFiles);

export default router;