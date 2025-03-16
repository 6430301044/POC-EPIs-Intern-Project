import express from 'express';
import { getSeaWaterData } from '../controllers/seaWater/index';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get(`/${encodeURIComponent('ผลการตรวจวัดคุณภาพน้ำทะเล')}`, async (req, res) => {
router.get(`/SeaWater`, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getSeaWaterData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching Sea water data:", error);
        res.status(500).send('Error fetching Sea water data');
    }
});

export default router;