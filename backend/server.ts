import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index';
import uploadNewsRoutes from './routes/uploadNewsRoutes';

const app = express();
const PORT = 5000;

// ตั้งค่า CORS ให้รองรับ credentials
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'], // URL ของ frontend (รองรับหลาย URL)
    credentials: true, // อนุญาตให้ส่ง cookies ข้าม domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type']
}));

app.use(express.json());
app.use(cookieParser()); // เพิ่ม middleware สำหรับอ่าน cookies

app.use('/api', apiRoutes);

app.use('/upload/news', uploadNewsRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});