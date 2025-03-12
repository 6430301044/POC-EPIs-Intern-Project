import express from "express";
import { registerUser, getPendingUsers, approveUser, rejectUser } from "../controllers/register/registerController"; 

const router = express.Router();

router.post("/", registerUser);          // สมัครสมาชิก
router.get("/pending", getPendingUsers); // ดึงข้อมูลรออนุมัติ
router.post("/approve/:id", approveUser); // อนุมัติ
router.post("/reject/:id", rejectUser);  // ปฏิเสธ

export default router;
