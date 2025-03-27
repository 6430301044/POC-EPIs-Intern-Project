import { Request, Response } from "express";

/**
 * ฟังก์ชันสำหรับออกจากระบบ (Logout)
 * @param req Request object
 * @param res Response object
 */
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // ลบ cookie token
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};