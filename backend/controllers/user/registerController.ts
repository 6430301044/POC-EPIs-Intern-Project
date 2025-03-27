import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sql from "mssql";
import { connectToDB } from "../../db/dbConfig";

// ฟังก์ชันลงทะเบียนผู้ใช้ใหม่
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { User_name, User_email, User_phone, Company_id, User_Job_Position, User_password } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!User_name || !User_email || !User_phone || !Company_id || !User_Job_Position || !User_password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const pool = await connectToDB();
    
    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const checkEmailQuery = "SELECT User_id FROM dbo.Users WHERE User_email = @Email";
    const emailCheck = await pool.request()
      .input("Email", sql.NVarChar, User_email)
      .query(checkEmailQuery);

    if (emailCheck.recordset.length > 0) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // เข้ารหัสรหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(User_password, salt);

    // บันทึกข้อมูลลงในตาราง Register
    const insertQuery = `
      INSERT INTO dbo.Register (
        User_name, 
        User_email, 
        User_phone, 
        Company_id,
        User_Job_Position, 
        User_password, 
        User_status
      ) VALUES (
        @UserName, 
        @UserEmail, 
        @UserPhone, 
        @CompanyId,
        @UserJobPosition, 
        @UserPassword, 
        'pending'
      )
    `;

    await pool.request()
      .input("UserName", sql.NVarChar, User_name)
      .input("UserEmail", sql.NVarChar, User_email)
      .input("UserPhone", sql.VarChar, User_phone)
      .input("CompanyId", sql.Int, Company_id)
      .input("UserJobPosition", sql.NVarChar, User_Job_Position)
      .input("UserPassword", sql.VarChar, hashedPassword)
      .query(insertQuery);

    res.status(201).json({ 
      success: true,
      message: "Registration successful! Your account is pending approval." 
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};