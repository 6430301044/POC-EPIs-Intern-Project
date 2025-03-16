import express from 'express';
import { getAirQualityData } from '../controllers/airQuality/index';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get(`/${encodeURIComponent('ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ')}`, async (req, res) => {
router.get("/AirQuality", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getAirQualityData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching air-airquality data:", error);
        res.status(500).send('Error fetching air-airquality data');
    }
});

export default router;