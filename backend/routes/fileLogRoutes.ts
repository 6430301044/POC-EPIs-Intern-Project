import express from "express";
import { getAllUploadedFiles, getAllReferenceDataPendingApprovalFiles, getUploadedFileById, getReferenceDataPendingApprovalFileById, deleteUploadedFilesById, deleteReferenceDataPendingApprovalFilesById } from "../controllers/fileLog/uploadTableController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/uploaded-files", getAllUploadedFiles);
router.get("/uploaded-files/:upload_id", getUploadedFileById);
router.delete("/uploaded-files/:upload_id", deleteUploadedFilesById);

router.get("/reference-data-pending-approval-files", getAllReferenceDataPendingApprovalFiles);
router.get("/reference-data-pending-approval-files/:upload_id", getReferenceDataPendingApprovalFileById);
router.delete("/reference-data-pending-approval-files/:upload_id", authenticateToken, authorizeRoles(['dev', 'approver']), deleteReferenceDataPendingApprovalFilesById);

export default router;