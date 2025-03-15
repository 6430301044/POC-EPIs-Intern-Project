import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

// Middleware ตรวจสอบ Token
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1]; // ดึง Token จาก Headers
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!); // ตรวจสอบ Token
    (req as any).user = decoded; // ใส่ข้อมูล user ลง req
    next(); // ไป API ถัดไป
  } catch (err) {
    console.error("Invalid Token:", err);
    return res.status(403).json({ message: "Unauthorized: Invalid or expired token" });
  }
}