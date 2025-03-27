import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { connectToDB } from "../../db/dbConfig";

// ค่าต่างๆ สำหรับการล็อคบัญชี
const MAX_ATTEMPTS = 5;
const BASE_LOCK_TIME = 10 * 60 * 1000; // 10 นาที
const LOCK_TIME_INCREMENT = 15 * 60 * 1000; // เพิ่มเวลาล็อค 15 นาทีทุกครั้งที่ล็อคใหม่
const RESET_LOCK_PERIOD = 1 * 24 * 60 * 60 * 1000; // รีเซ็ตการล็อคหากเกิน 1 วัน

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { User_email, User_password } = req.body;

    if (!User_email || !User_password) {
      res.status(400).json({ message: "Email and Password are required" });
      return;
    }

    const pool = await connectToDB();

    // คิวรีข้อมูลผู้ใช้
    const query = `
      SELECT User_id, User_name, User_email, User_password, User_role, 
             User_Job_Position, User_phone, Company_id, User_image, 
             User_login_attempts, User_lock_time, User_lock_count 
      FROM dbo.Users 
      WHERE User_email = @Email
    `;
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, User_email)
      .query(query);

    if (result.recordset.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const user = result.recordset[0];

    // ตรวจสอบว่า User ถูกล็อคหรือไม่
    if (user.User_lock_time && new Date(user.User_lock_time).getTime() > Date.now()) {
      return res.status(403).json({ 
        message: `บัญชีถูกล็อค กรุณาลองใหม่อีกครั้งใน ${Math.ceil((new Date(user.User_lock_time).getTime() - Date.now()) / 60000)} นาที`
      });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(User_password, user.User_password);

    if (!isMatch) {
      let attempts = user.User_login_attempts + 1;
      let lock_time = null;
      let lock_count = user.User_lock_count;

      if (attempts >= MAX_ATTEMPTS) {
        lock_count += 1;
        lock_time = new Date(Date.now() + BASE_LOCK_TIME + (lock_count - 1) * LOCK_TIME_INCREMENT);

        // ล็อคบัญชี และรีเซ็ตจำนวนครั้งที่ผิด
        await pool.request()
          .input("LockTime", sql.DateTime, lock_time)
          .input("LockCount", sql.Int, lock_count)
          .input("Email", sql.NVarChar, User_email)
          .query("UPDATE dbo.Users SET User_login_attempts = 0, User_lock_time = @LockTime, User_lock_count = @LockCount WHERE User_email = @Email");

        return res.status(403).json({ message: `บัญชีของคุณถูกล็อค กรุณาลองใหม่อีกครั้งใน ${Math.ceil((BASE_LOCK_TIME + (lock_count - 1) * LOCK_TIME_INCREMENT) / 60000)} นาที` });
      } else {
        // อัปเดตจำนวนครั้งที่กรอกรหัสผิด
        await pool.request()
          .input("Attempts", sql.Int, attempts)
          .input("Email", sql.NVarChar, User_email)
          .query("UPDATE dbo.Users SET User_login_attempts = @Attempts WHERE User_email = @Email");

        return res.status(401).json({ message: "Invalid email or password" });
      }
    }

    // รีเซ็ตค่าการล็อคเมื่อเข้าสู่ระบบสำเร็จ
    let shouldResetLockCount = false;
    if (user.User_lock_time) {
      const lastLockDate = new Date(user.User_lock_time);
      if (Date.now() - lastLockDate.getTime() > RESET_LOCK_PERIOD) {
        shouldResetLockCount = true;
      }
    }

    const resetQuery = shouldResetLockCount
      ? "UPDATE dbo.Users SET User_login_attempts = 0, User_lock_time = NULL, User_lock_count = 0 WHERE User_email = @Email"
      : "UPDATE dbo.Users SET User_login_attempts = 0, User_lock_time = NULL WHERE User_email = @Email";

    await pool.request()
      .input("Email", sql.NVarChar, User_email)
      .query(resetQuery);

    // สร้าง JWT token
    const token = jwt.sign(
      {
        userId: user.User_id,
        name: user.User_name,
        email: user.User_email,
        role: user.User_role || "uploader",
        jobPosition: user.User_Job_Position || "",
        phone: user.User_phone || "",
        companyId: user.Company_id,
        imageUrl: user.User_image || "https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg",
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // ตั้งค่า cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600000,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.User_id,
        name: user.User_name,
        email: user.User_email,
        role: user.User_role || "uploader",
        jobPosition: user.User_Job_Position || "",
        phone: user.User_phone || "",
        companyId: user.Company_id,
        imageUrl: user.User_image || "https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
