import express from "express";
import multer from "multer";
import { loginUser } from "../controllers/user/authController";
import { getPendingRegistrations, approveRegistration, rejectRegistration } from "../controllers/user/approveUserController";
import { registerUser } from "../controllers/user/registerController";
import { getCompanies } from "../controllers/user/companyController";
import { uploadUserImage, getUserImage } from "../controllers/user/userImageController";
import { refreshToken } from "../controllers/user/tokenController";
import { getAllUsers } from "../controllers/user/userController";
import { authenticateToken, authorizeApperover, authorizeRoles } from "../middleware/authMiddleware";

const router = express.Router();

// ตั้งค่า multer สำหรับอัพโหลดไฟล์
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // จำกัดขนาดไฟล์ 2MB
  },
});

// Authentication routes - ไม่ต้องการการยืนยันตัวตน
router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/companies", getCompanies);

// User registration approval routes - ต้องการสิทธิ์ admin
router.get("/register/pending", authenticateToken, authorizeApperover, getPendingRegistrations);
router.post("/register/approve/:registerId", authenticateToken, authorizeApperover, approveRegistration);
router.post("/register/reject/:registerId", authenticateToken, authorizeApperover, rejectRegistration);

// User image routes
router.post("/image/upload", authenticateToken, upload.single("file"), uploadUserImage);
router.get("/image/:user_id", authenticateToken, getUserImage);

// Token routes
router.post("/token/refresh", authenticateToken, refreshToken);

// User management routes
router.get("/all", authenticateToken, authorizeRoles(['approver', 'dev']), getAllUsers);

export default router;