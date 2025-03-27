import express from "express";
import { getAllPendingApprovals, getPendingApprovalById } from "../controllers/refTable/refTableController";

const router = express.Router();

// Get all reference data pending approvals
router.get("/pending-approvals", getAllPendingApprovals);

// Get reference data pending approval by ID
router.get("/pending-approval/:id", getPendingApprovalById);

export default router;