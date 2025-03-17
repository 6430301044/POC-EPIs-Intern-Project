// NewsRoutes.ts
import { Request, Response } from 'express';
import express from 'express';
import { getNewsFromDatabase } from '../controllers/News/newsController'; // ตรวจสอบ import ฟังก์ชัน

const router = express.Router();

// ตั้งค่า route สำหรับการดึงข้อมูลข่าว
router.get('/', async (req: Request, res: Response) => {
  const sortOrder = (req.query.sort as string) || 'desc'; // ✅ ป้องกัน Type Error
  try {
    const news = await getNewsFromDatabase(sortOrder); // ✅ ดึงข้อมูลข่าว
    res.json(news); 
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

export default router;
