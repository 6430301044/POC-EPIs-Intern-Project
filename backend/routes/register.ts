import express from "express";
import bcrypt from "bcryptjs";
import sql from "mssql";
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
    console.log("Connected to Azure SQL Database EiEi");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    return null;
  }
}

// **Interface สำหรับข้อมูลที่รับจากผู้ใช้**
interface RegisterRequestBody {
  User_name: string;
  User_email: string;
  User_phone: string;
  User_Job_Position: string;
  User_password: string;
}

// **API สำหรับลงทะเบียนผู้ใช้**
router.post("/", async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    console.log("Received body:", req.body); // เพิ่มการแสดงค่าของ req.body
    try {
      const { User_name, User_email, User_phone, User_Job_Position, User_password } = req.body;
  
      // เช็คว่าได้รับข้อมูลครบหรือไม่
      if (!User_name || !User_email || !User_phone || !User_Job_Position || !User_password) {
        console.log("Missing fields in body:", req.body); // เพิ่มการแสดงค่าข้อมูลที่ขาดหายไป
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // เชื่อมต่อกับฐานข้อมูล
      const pool = await connectDB();
      if (!pool) {
        console.error("Database connection failed"); // เพิ่มการแสดงข้อความถ้าเชื่อมต่อฐานข้อมูลไม่สำเร็จ
        return res.status(500).json({ message: "Database connection failed" });
      }
  
      // เช็คว่า Email มีอยู่แล้วหรือไม่
      const checkEmailQuery = "SELECT * FROM dbo.Users WHERE User_email = @Email";
      const checkEmailResult = await pool
        .request()
        .input("Email", sql.NVarChar, User_email)
        .query(checkEmailQuery);
  
      if (checkEmailResult.recordset.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      // สร้าง Salt และ Hash รหัสผ่าน
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(User_password, salt);
  
      // เพิ่มข้อมูลลงฐานข้อมูล
      const query = `
        INSERT INTO dbo.Users (User_name, User_email, User_phone, User_Job_Position, User_password)
        VALUES (@UserName, @Email, @Phone, @Job, @Password)
      `;

      await pool
        .request()
        .input("UserName", sql.NVarChar, User_name)
        .input("Email", sql.NVarChar, User_email)
        .input("Phone", sql.VarChar, User_phone)
        .input("Job", sql.NVarChar, User_Job_Position)
        .input("Password", sql.VarChar, hashedPassword)
        .query(query);
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;
