import { Request, Response } from "express";
import sql from "mssql";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectToDB } from "../../db/dbConfig";

dotenv.config();

// ✅ ฟังก์ชันเชื่อมต่อฐานข้อมูล
async function connectDB(): Promise<sql.ConnectionPool | null> {
  try {
    const pool = await sql.connect({
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      server: process.env.DB_SERVER!,
      database: process.env.DB_NAME!,
      options: { encrypt: true, enableArithAbort: true }
    });
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    return null;
  }
}

// ✅ ฟังก์ชันสมัครสมาชิก (Register)
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { User_name, User_email, User_phone, User_Job_Position, User_password, Company_id } = req.body;
      if (!User_name || !User_email || !User_phone || !User_Job_Position || !User_password) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }
  
      const pool = await connectDB();
      if (!pool) {
        res.status(500).json({ message: "Database connection failed" });
        return;
      }
  
      const checkEmailQuery = "SELECT * FROM dbo.Register WHERE User_email = @Email";
      const checkEmailResult = await pool.request()
        .input("Email", sql.NVarChar, User_email)
        .query(checkEmailQuery);
  
      if (checkEmailResult.recordset.length > 0) {
        res.status(400).json({ message: "Email already registered" });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(User_password, 10);
  
      const query = `
        INSERT INTO dbo.Register (User_name, User_email, User_phone, User_Job_Position, User_password, Company_id)
        VALUES (@UserName, @Email, @Phone, @Job, @Password, @CompanyId)
      `;
  
      await pool.request()
        .input("UserName", sql.NVarChar, User_name)
        .input("Email", sql.NVarChar, User_email)
        .input("Phone", sql.VarChar, User_phone)
        .input("Job", sql.NVarChar, User_Job_Position)
        .input("Password", sql.VarChar, hashedPassword)
        .input("CompanyId", sql.Int, Company_id || null)
        .query(query);
  
      res.status(201).json({ message: "User registered successfully, pending approval" });
    } catch (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

// ✅ ฟังก์ชันดึงรายการผู้ใช้ที่รออนุมัติ
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    if (!pool) return res.status(500).json({ message: "Database connection failed" });

    const query = "SELECT * FROM dbo.Register";
    const result = await pool.request().query(query);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ฟังก์ชันอนุมัติผู้ใช้
export const approveUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pool = await connectDB();
      if (!pool) return res.status(500).json({ message: "Database connection failed" });
  
      // ดึงข้อมูลจาก Register
      const userQuery = "SELECT * FROM dbo.Register WHERE Register_id = @Id";
      const userResult = await pool.request().input("Id", sql.Int, id).query(userQuery);
      if (userResult.recordset.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      const user = userResult.recordset[0];
  
      // ย้ายไป Users
      const insertQuery = `
        INSERT INTO dbo.Users (User_name, User_email, User_phone, User_Job_Position, User_password, Company_id)
        VALUES (@UserName, @Email, @Phone, @Job, @Password, @CompanyId)
      `;
      await pool.request()
        .input("UserName", sql.NVarChar, user.User_name)
        .input("Email", sql.NVarChar, user.User_email)
        .input("Phone", sql.VarChar, user.User_phone)
        .input("Job", sql.NVarChar, user.User_Job_Position)
        .input("Password", sql.VarChar, user.User_password)
        .input("CompanyId", sql.Int, user.Company_id || null)
        .query(insertQuery);
  
      // ลบจาก Register
      const deleteQuery = "DELETE FROM dbo.Register WHERE Register_id = @Id";
      await pool.request().input("Id", sql.Int, id).query(deleteQuery);
  
      res.status(200).json({ message: "User approved successfully" });
  
    } catch (err) {
      console.error("Error approving user:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  

// ✅ ฟังก์ชันปฏิเสธผู้ใช้
export const rejectUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pool = await connectDB();
      if (!pool) return res.status(500).json({ message: "Database connection failed" });
  
      const query = "DELETE FROM dbo.Register WHERE Register_id = @Id";
      await pool.request().input("Id", sql.Int, id).query(query);
  
      res.status(200).json({ message: "User rejected successfully" });
  
    } catch (err) {
      console.error("Error rejecting user:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
