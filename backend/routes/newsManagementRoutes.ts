import express from "express";
import { deleteNewsByCondition, deleteUploadedFilesByCondition } from "../controllers/upload/newsManagementController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = express.Router();

// Routes for news management
router.delete("/delete-news", authenticateToken, authorizeRoles(['dev', 'approver']), deleteNewsByCondition);
router.delete("/delete-uploads", authenticateToken, authorizeRoles(['dev', 'approver']), deleteUploadedFilesByCondition);

export default router;