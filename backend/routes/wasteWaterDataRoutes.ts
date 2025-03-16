import express from 'express';
import { getWasteWaterData } from '../controllers/wasteWater/index';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get(`/${encodeURIComponent('ผลการตรวจวัดคุณภาพน้ำทิ้ง')}`, async (req, res) => {
router.get(`/WasteWater`, async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getWasteWaterData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching Waste water data:", error);
        res.status(500).send('Error fetching Waste water data');
    }
});

export default router;