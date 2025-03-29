import express from "express";
import multer from "multer";
import { getAllNews, getNewsById, deleteNewsById } from "../controllers/news/index";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = express.Router();

// ตั้งค่า multer สำหรับอัพโหลดไฟล์
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์ 5MB
  },
});

// Routes สำหรับการจัดการข่าว
router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.delete("/:id", authenticateToken, authorizeRoles(['dev', 'approver']), deleteNewsById);

export default router;