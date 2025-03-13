import express from "express";
import { registerUser, getPendingUsers, approveUser, rejectUser } from "../controllers/register/registerController";

const router = express.Router();

// สมัครสมาชิก
router.post("/", async (req, res) => {
  try {
    await registerUser(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: (error as Error).message });
  }
});

// ดึงข้อมูลรออนุมัติ
router.get("/pending", async (req, res) => {
  try {
    await getPendingUsers(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending users", error: (error as Error).message });
  }
});

// อนุมัติ
router.post("/approve/:id", async (req, res) => {
  try {
    await approveUser(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error approving user", error: (error as Error).message });
  }
});

// ปฏิเสธ
router.post("/reject/:id", async (req, res) => {
  try {
    await rejectUser(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting user", error: (error as Error).message });
  }
});

export default router;
