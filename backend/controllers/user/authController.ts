import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { connectToDB } from "../../db/dbConfig";

// ฟังก์ชันเข้าสู่ระบบ (Login)
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { User_email, User_password } = req.body;
    
    if (!User_email || !User_password) {
      res.status(400).json({ message: "Email and Password are required" });
      return;
    }

    const pool = await connectToDB();
    
    const query = "SELECT u.User_id, u.User_name, u.User_email, u.User_password, u.User_role, u.User_Job_Position, u.User_phone, u.Company_id, u.User_image, c.companyName FROM dbo.Users u LEFT JOIN dbo.Companies c ON u.Company_id = c.company_id WHERE u.User_email = @Email";
    const result = await pool.request()
      .input("Email", sql.NVarChar, User_email)
      .query(query);

    if (result.recordset.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(User_password, user.User_password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        userId: user.User_id,
        name: user.User_name, 
        email: user.User_email,
        role: user.User_role || 'user',
        jobPosition: user.User_Job_Position || '',
        phone: user.User_phone || '',
        companyName: user.companyName || 'ไม่ระบุบริษัท',
        imageUrl: user.User_image || 'https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Login successful",
      user: { 
        id: user.User_id,
        name: user.User_name, 
        email: user.User_email,
        role: user.User_role || 'user',
        jobPosition: user.User_Job_Position || '',
        phone: user.User_phone || '',
        companyName: user.companyName || 'ไม่ระบุบริษัท',
        imageUrl: user.User_image || 'https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg'
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};