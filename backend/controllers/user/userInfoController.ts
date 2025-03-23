import { Request, Response } from "express";

/**
 * ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จาก token
 * @param req Request object
 * @param res Response object
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // ข้อมูลผู้ใช้จะถูกเพิ่มเข้าไปใน req.user โดย middleware authenticateToken
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // ส่งข้อมูลผู้ใช้กลับไป
    res.status(200).json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        jobPosition: user.jobPosition,
        phone: user.phone,
        companyName: user.companyName,
        imageUrl: user.imageUrl,
        exp: user.exp
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};