import express from 'express';
import { getNoiseLevelNormalData, getNoiseLevel90Data, getNoiseMonitorResultData } from '../controllers/noiseLevel/index';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get(`/${encodeURIComponent('ผลการตรวจวัดระดับเสียงโดยทั่วไป')}`, async (req, res) => {
router.get("/NoiseLevelNormal", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getNoiseLevelNormalData(offset, pageSize, filters);
        // The controller now returns an object with data and totalCount
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching NoiseLevelNormal data:", error);
        res.status(500).send('Error fetching NoiseLevelNormal data');
    }
});

// router.get(`/${encodeURIComponent('ผลการตรวจวัดระดับเสียง 90')}`, async (req, res) => {
    router.get("/NoiseLevel90", async (req, res) => {
        try {
            const offset = parseInt(req.query.offset as string) || 0;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const filters = {
                stationName: req.query.stationName as string || null,
                year: req.query.year as string || null,
                semiannual: req.query.semiannual as string || null,
            };
            const result = await getNoiseLevel90Data(offset, pageSize, filters);
            res.json(result);
        } catch (error) {
            console.error("❌ Error fetching NoiseLevel90 data:", error);
            res.status(500).send('Error fetching NoiseLevel90 data');
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