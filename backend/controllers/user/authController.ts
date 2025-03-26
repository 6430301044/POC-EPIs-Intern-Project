import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { connectToDB } from "../../db/dbConfig";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { otpStore, isOtpExpired, deleteExpiredOtp } from "../../db/otpStore";

// ฟังก์ชันสำหรับส่ง OTP ไปยังอีเมล
const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",  // ใช้ Gmail หรือบริการอื่น ๆ
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

// ฟังก์ชันสำหรับตรวจสอบ OTP
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { User_email, otp } = req.body;

    if (!User_email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    // ตรวจสอบว่า OTP มีอยู่หรือไม่
    const storedOtp = otpStore[User_email];

    if (!storedOtp) {
      res.status(400).json({ message: "No OTP found for this email" });
      return;
    }

    // ตรวจสอบว่า OTP หมดอายุหรือไม่
    if (isOtpExpired(storedOtp)) {
      deleteExpiredOtp(User_email);  // ลบ OTP ที่หมดอายุแล้ว
      res.status(400).json({ message: "OTP has expired or is invalid" });
      return;
    }

    // ตรวจสอบว่า OTP ตรงกันหรือไม่
    if (storedOtp.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // ถ้าถูกต้อง ให้นำทางไปยังหน้าใหม่หรือกระทำอื่น ๆ
    res.status(200).json({ message: "OTP verified successfully" });

    // ลบ OTP หลังจากตรวจสอบแล้ว
    deleteExpiredOtp(User_email);  // ลบ OTP ที่ใช้แล้วเพื่อความปลอดภัย
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ฟังก์ชันเข้าสู่ระบบ (Login)
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { User_email, User_password } = req.body;

    if (!User_email || !User_password) {
      res.status(400).json({ message: "Email and Password are required" });
      return;
    }

    const pool = await connectToDB();

    const query =
      "SELECT u.User_id, u.User_name, u.User_email, u.User_password, u.User_role, u.User_Job_Position, u.User_phone, u.Company_id, u.User_image, c.companyName FROM dbo.Users u LEFT JOIN dbo.Companies c ON u.Company_id = c.company_id WHERE u.User_email = @Email";
    const result = await pool
      .request()
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

    // สร้าง OTP
    const otp = crypto.randomInt(100000, 999999).toString();  // สร้าง OTP 6 หลัก
    const otpExpiration = Date.now() + 5 * 60 * 1000;  // กำหนดเวลา OTP หมดอายุ (5 นาที)

    // เก็บ OTP ในฐานข้อมูล (หรือใช้วิธีอื่น เช่น เก็บในตัวแปรในหน่วยความจำ)
    otpStore[User_email] = { otp, expiration: otpExpiration };

    // ส่ง OTP ไปยังอีเมล
    await sendOtpEmail(User_email, otp);

    // สร้าง JWT token ข้อมูลที่ต้องการเก็บใน token นี้คือข้อมูลผู้ใช้
    const token = jwt.sign(
      {
        userId: user.User_id,
        name: user.User_name,
        email: user.User_email,
        role: user.User_role || "uploader",
        jobPosition: user.User_Job_Position || "",
        phone: user.User_phone || "",
        companyName: user.companyName || "ไม่ระบุบริษัท",
        imageUrl:
          user.User_image ||
          "https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg",
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // ตั้งค่า cookie แบบ HttpOnly
    res.cookie("token", token, {
      httpOnly: true, // ป้องกัน JavaScript เข้าถึง cookie
      secure: process.env.NODE_ENV === 'production', // ใช้เฉพาะ HTTPS ใน production
      sameSite: "none", // เปลี่ยนเป็น none เพื่อให้ส่ง cookie ข้าม domain ได้ดีขึ้น
      maxAge: 3600000, // 1 ชั่วโมง (1h) ตรงกับ expiresIn ของ token
      path: "/", // ใช้ได้ทั้งเว็บไซต์
    });

    res.status(200).json({
      message: "Login successful. Please enter OTP to proceed.",
      user: {
        id: user.User_id,
        name: user.User_name,
        email: user.User_email,
        role: user.User_role || "uploader",
        jobPosition: user.User_Job_Position || "",
        phone: user.User_phone || "",
        companyName: user.companyName || "ไม่ระบุบริษัท",
        imageUrl:
          user.User_image ||
          "https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
