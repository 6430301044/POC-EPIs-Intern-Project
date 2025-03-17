import express from "express";  
import bcrypt from "bcryptjs";
import sql from "mssql";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import type { Request, Response } from "express";

dotenv.config();

const router = express.Router();

// ตั้งค่าเชื่อมต่อฐานข้อมูล
const dbConfig: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
async function connectDB(): Promise<sql.ConnectionPool | null> {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Connected to Azure SQL Database for Login");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    return null;
  }
}

// **Interface สำหรับข้อมูล Login**
interface LoginRequestBody {
  User_email: string;
  User_password: string;
}

// **API สำหรับเข้าสู่ระบบ**
router.post("/", async (req: Request, res: Response) => {
    console.log("🟢 API Hit: Login Endpoint");
    console.log("Received Body:", req.body);
  
    try {
      const { User_email, User_password } = req.body;
      console.log("Checking email:", User_email); // ตรวจสอบค่าที่รับมา
  
      if (!User_email || !User_password) {
        return res.status(400).json({ message: "Email and Password are required" });
      }
  
      const pool = await connectDB();
      if (!pool) {
        return res.status(500).json({ message: "Database connection failed" });
      }

      // ดึงข้อมูลผู้ใช้จากฐานข้อมูล รวมถึง Role ของผู้ใช้
      const query = `
        SELECT User_id, User_name, User_email, User_password, User_role 
        FROM dbo.Users 
        WHERE User_email = @Email
      `;
      console.log("Executing query:", query);
      
      const result = await pool.request().input("Email", sql.NVarChar, User_email).query(query);
  
      if (result.recordset.length === 0) {
        console.log("User not found");
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const user = result.recordset[0];
      console.log("User found:", user);
      
      // ตรวจสอบรหัสผ่าน
      const isMatch = await bcrypt.compare(User_password, user.User_password);
      console.log("Password Match:", isMatch);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // สร้าง JWT Token โดยเพิ่ม role
      const token = jwt.sign(
        { 
          userId: user.User_id, 
          name: user.User_name, 
          email: user.User_email, 
          role: user.User_role // เพิ่ม role ของผู้ใช้
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } // กำหนดอายุ Token
      );

      // ส่ง token และข้อมูลผู้ใช้กลับไปยัง frontend
      res.status(200).json({
        message: "Login successful",
        token,
        user: { 
          userId: user.User_id, 
          name: user.User_name, 
          email: user.User_email,
          role: user.User_role 
        },
      });
  
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
});
  

export default router;
