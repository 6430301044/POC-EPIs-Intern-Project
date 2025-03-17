import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { connectToDB } from "../../db/dbConfig";
import sql from "mssql";

/**
 * Refreshes the JWT token with updated user data
 * @param req Request object containing userId and optional imageUrl
 * @param res Response object
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, imageUrl } = req.body;
    
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const pool = await connectToDB();
    
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const query = "SELECT u.User_id, u.User_name, u.User_email, u.User_role, u.User_Job_Position, u.User_phone, u.Company_id, u.User_image, c.companyName FROM dbo.Users u LEFT JOIN dbo.Companies c ON u.Company_id = c.company_id WHERE u.User_id = @UserId";
    const result = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(query);

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = result.recordset[0];
    
    // ใช้ imageUrl ที่ส่งมาถ้ามี มิฉะนั้นใช้ค่าจากฐานข้อมูล
    const userImageUrl = imageUrl || user.User_image || 'https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg';

    // สร้าง JWT token ใหม่
    const token = jwt.sign(
      { 
        userId: user.User_id,
        name: user.User_name, 
        email: user.User_email,
        role: user.User_role || 'user',
        jobPosition: user.User_Job_Position || '',
        phone: user.User_phone || '',
        companyName: user.companyName || 'ไม่ระบุบริษัท',
        imageUrl: userImageUrl
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Token refreshed successfully",
      token
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ message: "Server error" });
  }
};