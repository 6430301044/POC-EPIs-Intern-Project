import express from 'express';
import { getNoiseLevelData, getNoiseMonitorResultData } from '../controllers/noiseLevel/index';

const router = express.Router();

// router.get(`/${encodeURIComponent('ผลการตรวจวัดระดับเสียงโดยทั่วไป')}`, async (req, res) => {
router.get("/NoiseLevel", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getNoiseLevelData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching NoiseLevel data:", error);
        res.status(500).send('Error fetching NoiseLevel data');
    }
});

// router.get(`/${encodeURIComponent('ผลการติดตามตรวจสอบ')}`, async (req, res) => {
router.get("/Monitorresult", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getNoiseMonitorResultData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching MonitorResult data:", error);
        res.status(500).send('Error fetching MonitorResult data');
    }
});


export default router;